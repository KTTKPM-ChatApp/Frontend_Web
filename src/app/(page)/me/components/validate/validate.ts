import * as Yup from "yup";
export interface ChangePasswordFormValues {
  newPassword: string;
  confirmNewPassword: string;
}
export const initialValues: ChangePasswordFormValues = {
  newPassword: "",
  confirmNewPassword: "",
};

export const validationSchema = Yup.object({
  newPassword: Yup.string()
    .trim()
    .required("Vui lòng nhập mật khẩu mới.")
    .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự.")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
      "Password must contain at least one uppercase, one lowercase, and one number"
    ),

  confirmNewPassword: Yup.string()
    .trim()
    .required("Vui lòng nhập lại mật khẩu mới.")
    .oneOf(
      [Yup.ref("newPassword")],
      "Mật khẩu mới và nhập lại mật khẩu chưa trùng."
    ),
});