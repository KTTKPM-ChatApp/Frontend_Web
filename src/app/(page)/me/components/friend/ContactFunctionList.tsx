"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import ForwardToInboxOutlinedIcon from '@mui/icons-material/ForwardToInboxOutlined';
import { useTrans } from "@/src/common/utilities/hook/trans";

export type ContactView =
    | "friends"
    | "groups"
    | "friendRequests"
    | "sentRequests";

interface Props {
    value: ContactView;
    onChange: (value: ContactView) => void;
}

const Wrap = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 12,
});

const Item = styled(Box, {
    shouldForwardProp: (prop) => prop !== "active",
})<{ active?: boolean }>(({ active }) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 10,
    cursor: "pointer",
    color: "#0F172A",
    background: active ? "#EAF2FF" : "transparent",
    fontWeight: active ? 600 : 500,
    transition: "all 0.2s ease",
    "&:hover": {
        background: active ? "#EAF2FF" : "#F8FAFC",
    },
}));

const Label = styled(Typography)({
    fontSize: 15,
});

export default function ContactFunctionList({ value, onChange }: Props) {
    const t = useTrans();
    return (
        <Wrap>
            <Item active={value === "friends"} onClick={() => onChange("friends")}>
                <PeopleOutlineIcon fontSize="small" />
                <Label>{t("FRIEND.LABEL_FRIENDS")}</Label>
            </Item>

            <Item active={value === "groups"} onClick={() => onChange("groups")}>
                <GroupsOutlinedIcon fontSize="small" />
                <Label>{t("FRIEND.LABEL_GROUPS")}</Label>
            </Item>

            <Item
                active={value === "friendRequests"}
                onClick={() => onChange("friendRequests")}
            >
                <PersonAddAltOutlinedIcon fontSize="small" />
                <Label>{t("FRIEND.LABEL_REQUESTS")}</Label>
            </Item>

            <Item
                active={value === "sentRequests"}
                onClick={() => onChange("sentRequests")}
            >
                <ForwardToInboxOutlinedIcon fontSize="small" />
                <Label>{t("FRIEND.LABEL_SENT")}</Label>
            </Item>
        </Wrap>
    );
}