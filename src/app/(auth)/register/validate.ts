import { Gender } from "@/src/common/interface/auth-interface";
import * as yup from "yup";

export const initialValues = {
    firebaseIdToken: "",
    password: "",
    email: "",
    dateOfBirth: "",
    gender: "male" as Gender,
    fullName: ""
};

export const validationSchemaRegisForm = (Trans: (key: string) => string) =>
    yup.object({
        // email: yup
        //     .string()
        //     .trim()
        //     .email(Trans("REGIS.EMAIL_INVALID"))
        //     .required(Trans("REGIS.EMAIL_REQUIRED")),

        password: yup
            .string()
            .min(6, Trans("REGIS.PASSWORD_MIN"))
            .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, Trans("REGIS.PASSWORD_RULE"))
            .required(Trans("REGIS.PASSWORD_REQUIRED")),
    });

export const schemaRegisAfterOtp = (Trans: (key: string) => string) =>
    yup.object({
        firebaseIdToken: yup
            .string()
            .required(Trans("REGIS.FIREBASE.REQUIRED")),

        dateOfBirth: yup
            .string()
            .required(Trans("REGIS.DOB_REQUIRED"))
            .test("not-in-future", "Ngày sinh không hợp lệ", (value) => {
                if (!value) return false;
                return new Date(value) <= new Date();
            }),

        gender: yup
            .mixed<Gender>()
            .oneOf(["male", "female", "other"])
            .required(Trans("REGIS.GENDER_REQUIRED")),

        fullName: yup
            .string()
            .min(2, Trans("REGIS.FULLNAME_MIN"))
            .required(Trans("REGIS.FULLNAME_REQUIRED")),
    });

export const validationSchemaRegisFull = (Trans: (key: string) => string) =>
    validationSchemaRegisForm(Trans).concat(schemaRegisAfterOtp(Trans));