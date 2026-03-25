const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export const registerTrainer = async (formData) => {
  try {
    console.log("this is formdata",formData)
    const response = await fetch(`${BACKEND_URL}/api/trainer/register`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to register trainer');
    }

    return await response.json();
  } catch (err) {
    console.error("Error registering trainer:", err);
    throw err;
  }
};
