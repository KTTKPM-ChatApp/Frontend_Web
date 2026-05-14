"use client";

import MuiAvatar, { AvatarProps } from "@mui/material/Avatar";
import { getInitialsName } from "../../common/helpers/getInitName.helpers";

interface AppAvatarProps extends Omit<AvatarProps, "src"> {
  src?: string | null;
  name: string | null;
  size?: number;
  fontSize?: number;
}

export default function AppAvatar({
  src,
  name,
  size = 32,
  alt,
  sx,
  children,
  fontSize = 16,
  ...rest
}: AppAvatarProps) {
  const finalSrc =
    src ||
    "https://static.vecteezy.com/system/resources/previews/026/434/409/non_2x/default-avatar-profile-icon-social-media-user-photo-vector.jpg";

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
