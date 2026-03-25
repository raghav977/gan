import { registerTrainer } from "../api/trainer"

export const registerTrainerService = (formPayload) => {
  return registerTrainer(formPayload)
}
