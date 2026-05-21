"use client";

import MuiAvatar, { AvatarProps } from "@mui/material/Avatar";
import { getInitialsName } from "../../common/helpers/getInitName.helpers";
import GroupsIcon from "@mui/icons-material/Groups";

export const DEFAULT_AVATAR_URL =
  "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg";

interface AppAvatarProps extends Omit<AvatarProps, "src"> {
  src?: string | null;
  name: string | null;
  size?: number;
  fontSize?: number;
  isGroup?: boolean;
}

export default function AppAvatar({
  src,
  name,
  size = 32,
  alt,
  sx,
  children,
  fontSize = 16,
  isGroup = false,
  ...rest
}: AppAvatarProps) {
  if (isGroup && !src) {
    return (
      <MuiAvatar
        alt={alt ?? name ?? ""}
        sx={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #0068FF 0%, #00B4FF 100%)",
          fontSize: fontSize * 0.8,
          fontWeight: 500,
          ...sx,
        }}
        {...rest}
      >
        <GroupsIcon sx={{ fontSize: size * 0.5, color: "#fff" }} />
      </MuiAvatar>
    );
  }

  const finalSrc = src || DEFAULT_AVATAR_URL;

  const fallback = children || getInitialsName(name ?? "") || "A";
  return (
    <MuiAvatar
      src={finalSrc}
      alt={alt ?? name ?? ""}
      sx={{
        width: size,
        height: size,
        fontSize,
        fontWeight: 700,
        ...sx,
      }}
      {...rest}
    >
      {fallback}
    </MuiAvatar>
  );
}

export const buildS3Url = (src?: string | null) => src ?? null;
