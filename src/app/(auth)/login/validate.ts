import * as yup from "yup";

export const initialValues = {
    email: "",
    password: "",
};

export const validationSchemaLogin = (Trans: (key: string) => string) => {
    return yup.object({
        email: yup
            .string()
            .email(Trans("VALIDATION.EMAIL_INVALID") || "Email không hợp lệ")
            .required(Trans("LOGIN.EMAIL.REQUIRED")),
        password: yup
            .string()
            .required(Trans("LOGIN.PASSWORD.REQUIRED")),
    });
};
