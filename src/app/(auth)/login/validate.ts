import * as yup from "yup";

export const initialValues = {
    email: "",
    password: "",
};

export const validationSchemaLogin = (Trans: (key: string) => string) => {
    return yup.object({
        email: yup
            .string()
            .required(Trans("LOGIN.EMAIL.REQUIRED"))
            .email(Trans("VALIDATION.EMAIL_INVALID") || "Email không hợp lệ"),
        password: yup
            .string()
            .required(Trans("LOGIN.PASSWORD.REQUIRED")),
    });
};
