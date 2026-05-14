import * as Yup from "yup";
export const initialValues = {
    groupName: "",
};
export const createGroupValidationSchema = Yup.object({
    groupName: Yup.string()
        .trim()
        .required("Vui lòng nhập tên nhóm"),
});