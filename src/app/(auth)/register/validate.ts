import { Gender } from "@/src/common/interface/auth-interface";
import * as yup from "yup";

export const initialValues = {
    username: "",
    password: "",
    email: "",
    displayName: "",
    dateOfBirth: "",
    gender: "male" as Gender,
};

export const validationSchemaRegisForm = (Trans: (key: string) => string) =>
    yup.object({
        username: yup
            .string()
            .trim()
            .min(3, Trans("REGIS.USERNAME_MIN") || "Username phải có ít nhất 3 ký tự")
            .required(Trans("REGIS.USERNAME_REQUIRED") || "Username là bắt buộc"),

        email: yup
            .string()
            .trim()
            .email(Trans("REGIS.EMAIL_INVALID") || "Email không hợp lệ")
            .required(Trans("REGIS.EMAIL_REQUIRED") || "Email là bắt buộc"),
        
        password: yup
            .string()
            .min(6, Trans("REGIS.PASSWORD_MIN") || "Mật khẩu phải có ít nhất 6 ký tự")
            .required(Trans("REGIS.PASSWORD_REQUIRED") || "Mật khẩu là bắt buộc"),

        displayName: yup
            .string()
            .trim()
            .required(Trans("REGIS.DISPLAYNAME_REQUIRED") || "Tên hiển thị là bắt buộc"),

        dateOfBirth: yup
            .string()
            .required(Trans("REGIS.DOB_REQUIRED") || "Ngày sinh là bắt buộc"),

        gender: yup
            .mixed<Gender>()
            .oneOf(["male", "female", "other"])
            .required(Trans("REGIS.GENDER_REQUIRED") || "Giới tính là bắt buộc"),
    });