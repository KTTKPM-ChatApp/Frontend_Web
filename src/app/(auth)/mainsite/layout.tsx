"use client";

import { useAuthStore } from "@/src/common/store/useAuthStore";
import { useMounted } from "@/src/common/utilities/hook/mounted";
import { useTrans } from "@/src/common/utilities/hook/trans";

import { Box, Grid, Stack, styled, Typography } from "@mui/material";
import Image from "next/image";
import { ReactNode } from "react";

const MainSiteStack = styled(Stack)({
    minHeight: "100vh",
    width: "100%", // ✅ tránh 100vw tràn ngang
    backgroundColor: "#E0E8EF",
});

const MenuAuth = styled(Typography)({
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "color 0.2s ease",
    "&:hover": { color: "#008ff3" },
});

const GridMenu = styled(Grid)({
    minHeight: "60px",
    alignItems: "center",
    boxShadow: "0 1px 1px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#ffffff",
});

const GridFooter = styled(Grid)({
    minHeight: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // ✅ tránh 100vw
    fontSize: "14px",
    backgroundColor: "#ffffff",
    textAlign: "center",
    padding: "0 16px",
});

const ContainerBox = styled(Box)({
    width: "65%",
    display: "flex",
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    padding: "50px 0px",
    paddingLeft: "5%",
    margin: "16px 0px",
});

const StackChildren = styled(Stack)({
    flex: 1,
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    margin: "0 auto",
});

const GridMenuItem = styled(Grid)({
    justifyContent: "right",
    gap: "24px",
});

const AuthLayout = ({ children }: { children: ReactNode }) => {
    const { authData } = useAuthStore();
    const mounted = useMounted();
    const Trans = useTrans();

    const isLoggedIn = !!authData?.data?.tokens?.accessToken;
    const avatarUrl = authData?.data?.user?.avatarUrl || "https://i.pravatar.cc/40";

    return (
        <MainSiteStack>
            <GridMenu data-testid="grid-menu" alignItems="center" container minHeight="60px" size={12}>
                <Grid paddingLeft="3%" size={2}>
                    <Image
                        src="https://stc-zaloprofile.zdn.vn/pc/v1/images/logo.svg"
                        alt="Logo"
                        width={80}
                        height={30}
                    />
                </Grid>

                <GridMenuItem container size={8}>
                    <MenuAuth>{Trans("HEADER.ZALO_PC")}</MenuAuth>
                    <MenuAuth>{Trans("HEADER.OFFICE_ACCOUNT")}</MenuAuth>
                    <MenuAuth>{Trans("HEADER.DEVELOPER")}</MenuAuth>
                    <MenuAuth>{Trans("HEADER.SECURITY")}</MenuAuth>
                    <MenuAuth>{Trans("HEADER.HELP")}</MenuAuth>
                    <MenuAuth>{Trans("HEADER.CONTACT")}</MenuAuth>
                    <MenuAuth>{Trans("HEADER.REPORT_VIOLATION")}</MenuAuth>

                    <MenuAuth>
                        {!mounted ? null : isLoggedIn ? (
                            <Image
                                src={avatarUrl}
                                alt="avatar"
                                width={28}
                                height={28}
                                style={{ borderRadius: "50%" }}
                            />
                        ) : (
                            Trans("HEADER.LOGIN")
                        )}
                    </MenuAuth>
                </GridMenuItem>

                <Grid size={2} />
            </GridMenu>

            <StackChildren data-testid="stack-children">
                <ContainerBox>{children}</ContainerBox>
            </StackChildren>

            <GridFooter>
                {Trans("FOOTER.COPYRIGHT")}
            </GridFooter>
        </MainSiteStack>
    );
};

export default AuthLayout;