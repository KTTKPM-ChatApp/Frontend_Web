"use client";

import { Box, Divider, Popover, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ReactNode } from "react";

export interface PopoverMenuItem {
    key: string;
    label: string;
    danger?: boolean;
    dividerTop?: boolean;
    onClick?: () => void;
}

interface MenuPopoverProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    items?: PopoverMenuItem[];
    width?: number;
    children?: ReactNode;
}

const PopoverContent = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "8px 0",
});

const MenuRow = styled(Box, {
    shouldForwardProp: (prop) => prop !== "danger",
})<{ danger?: boolean }>(({ danger }) => ({
    minHeight: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0px 16px",
    cursor: "pointer",
    color: danger ? "#E53935" : "#212121",
    "&:hover": {
        backgroundColor: "#F5F7FB",
    },
}));

const MenuLeft = styled(Box)({
    display: "flex",
    alignItems: "center",
});

const MenuText = styled(Typography)({
    fontSize: 14,
    fontWeight: 500,
});

const MenuPopover = ({
    anchorEl,
    open,
    onClose,
    items = [],
    width = 210,
    children,
}: MenuPopoverProps) => {
    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            transformOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            PaperProps={{
                sx: {
                    minWidth: width,
                    borderRadius: "14px",
                    boxShadow: "0px 8px 24px rgba(16, 24, 40, 0.16)",
                    overflow: "hidden",
                    ml: 1,
                    mb: 1,
                    p: 0,
                },
            }}
        >
            {children ? (
                <Box p={2}>{children}</Box>
            ) : (
                <PopoverContent>
                    {items.map((item) => (
                        <Box key={item.key}>
                            {item.dividerTop && <Divider />}
                            <MenuRow
                                danger={item.danger}
                                onClick={() => {
                                    item.onClick?.();
                                    onClose();
                                }}
                            >
                                <MenuLeft>
                                    <MenuText>{item.label}</MenuText>
                                </MenuLeft>
                            </MenuRow>
                        </Box>
                    ))}
                </PopoverContent>
            )}
        </Popover>
    );
};

export default MenuPopover;