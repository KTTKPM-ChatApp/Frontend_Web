"use client";

import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ContactView } from "./ContactFunctionList";
import SentFriendRequestList from "./SentFriendRequestList";
import GroupList from "./GroupList";
import PendingRequestFriendList from "./PendingRequestFriendList";
import FriendList from "./FriendList";

interface Props {
    view: ContactView;
}

const Wrap = styled(Box)({
    height: "100%",
    background: "#F3F5F7",
});

export default function ContactContentPanel({ view }: Props) {
    if (view === "sentRequests") {
        return < SentFriendRequestList />;
    }

    if (view === "groups") {
        return <GroupList />;
    }

    if (view === "friendRequests") {
        return <PendingRequestFriendList />;
    }

    return <FriendList />;
}