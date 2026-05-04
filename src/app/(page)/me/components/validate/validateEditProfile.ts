import * as Yup from "yup";

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export const profileFormSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .required("Họ và tên không được để trống"),

//   bio: Yup.string()
//     .max(255, "Bio tối đa 255 ký tự"),

//   gender: Yup.mixed<"male" | "female" | "other">()
//     .oneOf(["male", "female", "other"], "Giới tính không hợp lệ")
//     .required("Vui lòng chọn giới tính"),

//   dateOfBirth: Yup.string()
//     .nullable(),

//   phone: Yup.string(),

//   avatarFile: Yup.mixed<File | null>()
//     .nullable()
//     .test("fileType", "Vui lòng chọn file ảnh", (file) => {
//       if (!file) return true;
//       return file.type.startsWith("image/");
//     })
//     .test("fileSize", "Ảnh không được vượt quá 5MB", (file) => {
//       if (!file) return true;
//       return file.size <= MAX_AVATAR_SIZE;
//     }),
});