import { Product } from "../models/admin.product.js";
import { UserProduct } from "../models/user.product.js";
import { UserProductPayment } from "../models/userproduct.payment.model.js";
import axios from "axios";
import crypto from "crypto";
import { createNotification } from "../services/notification.service.js";
import { emitNotificationEvent } from "../socket/socket.js";

export const addToCart = async(req,res)=>{
    try{
        const userId = req.user.id;
        const { quantity = 1 } = req.body;
        const productId = req.params.productId || req.body.productId;

        // Check if the product is already in the cart
        const existingCartItem = await UserProduct.findOne({
            where: {
                userId,
                productId,
                status: 'PENDING'
            }
        });

        if(existingCartItem){
            return res.status(400).json({
                message:"Product is already in the cart"
            })
        }

        const product = await Product.findByPk(productId);
        if(!product){
            return res.status(404).json({
                message:"Product not found"
            })
        }

        const unitPrice = Number(product.productPrice);
        const itemQuantity = Number(quantity) || 1;

        if (Number.isNaN(unitPrice) || Number.isNaN(itemQuantity)) {
            return res.status(400).json({
                message: "Invalid product price or quantity"
            });
        }

        const cartItem = await UserProduct.create({
            userId,
            productId,
            quantity: itemQuantity,
            totalPrice: unitPrice * itemQuantity
        });

        return res.status(201).json({
            message:"Product added to cart",
            cartItem
        });
    }
    catch(err){
        return res.status(500).json({
            message:"Internal server error",
            error: err.message
        });
    }
}




export const getCartItems = async(req,res)=>{
    try{
        const userId = req.user.id;

        const {status,limit,page} = req.query;

        const pagination = {
            limit: parseInt(limit) || 10,
            offset: (parseInt(page) - 1) * (parseInt(limit) || 10) || 0
        };

        const cartItems = await UserProduct.findAll({
            where:{
                userId,
                status: status || 'PENDING'
            },
            ...pagination,
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: [
                        'id',
                        ['productName', 'name'],
                        ['productDescription', 'description'],
                        ['productPrice', 'price'],
                        'productImage'
                    ]
                }
            ]
        });

        return res.status(200).json({
            data: cartItems
        });
    }
    catch(err){
        return res.status(500).json({
            message:"Internal server error",
            error: err.message
        });
    }
}



export const removeFromCart = async(req,res)=>{
    try{
        const userId = req.user.id;
        const {cartItemId, productId} = req.params;

        const whereClause = {
            userId,
            status: 'PENDING'
        };

        if (cartItemId) {
            whereClause.id = cartItemId;
        } else if (productId) {
            whereClause.productId = productId;
        }

        const cartItem = await UserProduct.findOne({ where: whereClause });

        if(!cartItem){
            return res.status(404).json({
                message:"Cart item not found"
            })
        }

        await cartItem.destroy();

        return res.status(200).json({
            message:"Cart item removed"
        });
    }
    catch(err){
        return res.status(500).json({
            message:"Internal server error",
            error: err.message
        });
    }
}


export const purchaseItems = async(req,res)=>{
    try{
        const userId = req.user.id;

        const cartItems = await UserProduct.findAll({
            where:{
                userId,
                status: 'PENDING'
            },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: [
                        'id',
                        ['productName', 'name'],
                        ['productDescription', 'description'],
                        ['productPrice', 'price'],
                        'productImage'
                    ]
                }
            ]
        });

        if(cartItems.length === 0){
            return res.status(400).json({
                message:"No items in the cart to purchase"
            })
        }

        // Here you would typically integrate with a payment gateway
        // For simplicity, we'll just mark the items as purchased

    const amount = cartItems.reduce((total, item) => total + Number(item.totalPrice || 0), 0);
        const tax_amount = 0;
        const total_amount = amount + tax_amount;


        const transaction_uuid = Date.now().toString();
        
            const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=EPAYTEST`;
        
            const secret = "8gBm/:&EnhH.1/q";
        
            const signature = crypto
                .createHmac("sha256", secret)
                .update(message)
                .digest("base64");

            console.log("Signature:", signature);



            const primaryCartItem = cartItems[0];

            const productpayment = await UserProductPayment.create({
                userId,
                productId: cartItems.length === 1 ? cartItems[0].productId : null,
                userProductId: primaryCartItem?.id,
                amount:total_amount,
                transaction_uuid,
                status: 'PENDING'
            });

            console.log("Product payment created:", productpayment);


                    const data = {
        amount,
        tax_amount,
        total_amount,
        transaction_uuid,
        product_code: "EPAYTEST",
                product_service_charge: 0,
                product_delivery_charge: 0,
        signature,
        signed_field_names: "total_amount,transaction_uuid,product_code",
                success_url: "http://localhost:5173/user/products/payment/success",
                failure_url: "http://localhost:5173/user/products/payment/failure",
    };

        return res.status(200).json({
            message:"Cart items purchased successfully",
            data
        });
    }
    catch(err){
        return res.status(500).json({
            message:"Internal server error",
            error: err.message
        });
    }
}



export const verifyPurchaseController = async(req,res)=>{
    try{
        const userId = req.user.id;
        // const {productId} = req.params;
        const { paymentData } = req.body;
        if(!paymentData){
            return res.status(400).json({
                message:"Payment data is required"
            })
        }

        const productCode = paymentData.product_code;
        const totalAmount = parseFloat(paymentData.total_amount);
        const transaction_id = paymentData.transaction_uuid;

        console.log("Transaction ID:", transaction_id);
        console.log("Product Code:", productCode);
        console.log("Total Amount:", totalAmount);

        const purchase = await UserProductPayment.findOne({
            where:{
                userId,
                transaction_uuid: transaction_id,
                status: 'PENDING'

            }
        });

        if(!purchase){
            return res.status(404).json({
                message:"Purchase not found"
            })
        }

        const response = await axios.get(`https://rc.esewa.com.np/api/epay/transaction/status/?product_code=${productCode}&total_amount=${totalAmount}&transaction_uuid=${transaction_id}`)

        if(response?.data?.status !== 'COMPLETE'){
            return res.status(400).json({
                message:"Payment verification failed"
            })
        }

        console.log("This is response",response);
        purchase.status='COMPLETED';
        await purchase.save();

        await UserProduct.update({
            status: 'PURCHASED'
        },{
            where:{
                userId,
                status: 'PENDING'
            }
        });

        const formattedAmount = Number.isFinite(totalAmount)
            ? totalAmount.toFixed(2)
            : paymentData.total_amount;

        const notification = await createNotification({
            userId,
            type: 'PRODUCT',
            title: 'Purchase confirmed',
            body: `We received Rs. ${formattedAmount}. Your items are now available.`,
            metadata: {
                transactionId: transaction_id,
                productCode
            }
        });

        emitNotificationEvent(userId, notification);


        return res.status(200).json({
            data: {
                purchased: true
            }
        });
    }
    catch(err){
        return res.status(500).json({
            message:"Internal server error",
            error: err.message
        });
    }
}
