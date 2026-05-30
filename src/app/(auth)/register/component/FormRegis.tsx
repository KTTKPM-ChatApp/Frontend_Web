"use client";

import * as React from "react";
import { Grid, Stack, Typography, MenuItem, Select } from "@mui/material";
import { useTrans } from "@/src/common/utilities/hook/trans";
import HttpsRoundedIcon from "@mui/icons-material/HttpsRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CakeIcon from '@mui/icons-material/Cake';
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import TransgenderIcon from "@mui/icons-material/Transgender";
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import {
  AuthTextField,
  GridPswFrm,
  GridIcon,
  LoginButton,
  Forgot,
  StyledGenderItem,
  StyledGenderSelect,
} from "../../Auth.styles";
import { useEffect } from "react";
import { FormikLike } from "@/src/common/interface/formik-interface";
export interface FormRegisProps {
  formik: FormikLike;
  onGoLogin: () => void;
  errorMsg?: string | null;
}

export default function FormRegis(props: FormRegisProps) {
  const t = useTrans();
  const {
    formik,
    onGoLogin,
    errorMsg,
  } = props;


  return (
    <Stack gap={2} sx={{ padding: "24px 72px 32px" }}>
      <form onSubmit={formik.handleSubmit}>
        {/* USERNAME */}
        <GridPswFrm container size={12}>
          <GridIcon size={1}>
            <BadgeRoundedIcon color="action" sx={{ fontSize: 14 }} />
          </GridIcon>
          <Grid size={11}>
            <AuthTextField
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Username"
              type="text"
              fullWidth
              error={Boolean(formik.touched.username && formik.errors.username)}
              helperText={formik.touched.username ? formik.errors.username : ""}
            />
          </Grid>
        </GridPswFrm>

        {/* EMAIL */}
        <GridPswFrm container size={12}>
          <GridIcon size={1}>
            <EmailRoundedIcon color="action" sx={{ fontSize: 14 }} />
          </GridIcon>
          <Grid size={11}>
            <AuthTextField
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Email"
              type="email"
              fullWidth
              error={Boolean(formik.touched.email && formik.errors.email)}
              helperText={formik.touched.email ? formik.errors.email : ""}
            />
          </Grid>
        </GridPswFrm>

        {/* PASSWORD */}
        <GridPswFrm container size={12}>
          <GridIcon size={1}>
            <HttpsRoundedIcon color="action" sx={{ fontSize: 14 }} />
          </GridIcon>
          <Grid size={11}>
            <AuthTextField
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t("LOGIN.PASSWORD_PLACEHOLDER")}
              type="password"
              fullWidth
              error={Boolean(formik.touched.password && formik.errors.password)}
              helperText={formik.touched.password ? formik.errors.password : ""}
            />
          </Grid>
        </GridPswFrm>

        {/* CONFIRM PASSWORD */}
        <GridPswFrm container size={12}>
          <GridIcon size={1}>
            <HttpsRoundedIcon color="action" sx={{ fontSize: 14 }} />
          </GridIcon>
          <Grid size={11}>
            <AuthTextField
              name="confirmPsw"
              value={formik.values.confirmPsw ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t("REGIS.CONFIRM_PASSWORD_PLACEHOLDER")}
              type="password"
              fullWidth
              error={Boolean(formik.touched.confirmPsw && formik.errors.confirmPsw)}
              helperText={formik.touched.confirmPsw ? formik.errors.confirmPsw : ""}
            />
          </Grid>
        </GridPswFrm>

        {/* NAME */}
        <GridPswFrm container size={12}>
          <GridIcon size={1}>
            <BadgeRoundedIcon color="action" sx={{ fontSize: 14 }} />
          </GridIcon>
          <Grid size={11}>
            <AuthTextField
              name="displayName"
              placeholder={t("REGIS.FULLNAME_PLACEHOLDER")}
              value={formik.values.displayName ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              fullWidth
              error={Boolean(formik.touched.displayName && formik.errors.displayName)}
              helperText={formik.touched.displayName ? formik.errors.displayName : ""}
            />
          </Grid>
        </GridPswFrm>

        {/* DOB */}
        <GridPswFrm container size={12}>
          <GridIcon size={1}>
            <CakeIcon color="action" sx={{ fontSize: 14 }} />
          </GridIcon>
          <Grid size={11}>
            <AuthTextField
              name="dateOfBirth"
              value={formik.values.dateOfBirth ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              type="date"
              fullWidth
              error={Boolean(formik.touched.dateOfBirth && formik.errors.dateOfBirth)}
              helperText={formik.touched.dateOfBirth ? formik.errors.dateOfBirth : ""}
            />
          </Grid>
        </GridPswFrm>

        {/* GENDER */}
        <StyledGenderSelect
          name="gender"
          value={formik.values.gender ?? ""}
          onChange={formik.handleChange as any}
          fullWidth
          displayEmpty
          renderValue={(value) => {
            if (!value) return "Chọn giới tính";

            if (value === "male")
              return (
                <Stack direction="row" spacing={1} alignItems="center">
                  <MaleIcon fontSize="small" sx={{ color: "#1976D2" }} />
                  <Typography fontSize={14}>Nam</Typography>
                </Stack>
              );

            if (value === "female")
              return (
                <Stack direction="row" spacing={1} alignItems="center">
                  <FemaleIcon fontSize="small" sx={{ color: "#E91E63" }} />
                  <Typography fontSize={14}>Nữ</Typography>
                </Stack>
              );

            return (
              <Stack direction="row" spacing={1} alignItems="center">
                <TransgenderIcon fontSize="small" sx={{ color: "#9C27B0" }} />
                <Typography fontSize={14}>Khác</Typography>
              </Stack>
            );
          }}
        >
          <StyledGenderItem value="" disabled>
            Chọn giới tính
          </StyledGenderItem>

          <StyledGenderItem value="male">
            <Stack direction="row" spacing={1} alignItems="center">
              <MaleIcon fontSize="small" sx={{ color: "#1976D2" }} />
              <Typography fontSize={14}>Nam</Typography>
            </Stack>
          </StyledGenderItem>

          <StyledGenderItem value="female">
            <Stack direction="row" spacing={1} alignItems="center">
              <FemaleIcon fontSize="small" sx={{ color: "#E91E63" }} />
              <Typography fontSize={14}>Nữ</Typography>
            </Stack>
          </StyledGenderItem>

          <StyledGenderItem value="other">
            <Stack direction="row" spacing={1} alignItems="center">
              <TransgenderIcon fontSize="small" sx={{ color: "#9C27B0" }} />
              <Typography fontSize={14}>Khác</Typography>
            </Stack>
          </StyledGenderItem>
        </StyledGenderSelect>

        {errorMsg ? (
          <Typography color="error" fontSize={13} sx={{ mt: 1 }}>
            {errorMsg}
          </Typography>
        ) : null}

        <LoginButton type="submit" fullWidth sx={{ mt: 1 }}>
          Đăng ký
        </LoginButton>

        <Forgot onClick={onGoLogin}>Đã có tài khoản? Đăng nhập</Forgot>
      </form>
    </Stack>
  );
}