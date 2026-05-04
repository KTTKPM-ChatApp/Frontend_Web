"use client";

import { Box } from "@mui/material";
import MuiAvatar, { AvatarProps } from "@mui/material/Avatar";
import { styled } from "@mui/material/styles";
import { getInitialsName } from "../../common/helpers/getInitName.helpers";

interface AppAvatarProps extends Omit<AvatarProps, "src"> {
  src?: string | null;
  name?: string | null;
  size?: number;
  fontSize?: number;
  showNameFallback?: boolean;
  isGroup?: boolean;
  memberAvatarUrls?: (string | null | undefined)[];
}

const GroupClusterWrap = styled(Box)({
  position: "relative",
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  overflow: "hidden",
  background: "#FFFFFF",
});

const MiniAvatar = styled("img")({
  position: "absolute",
  objectFit: "cover",
  borderRadius: "50%",
  border: "1.5px solid #fff",
  background: "#D1D5DB",
  display: "block",
});

const CountBadge = styled(Box)({
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "#E2E8F0",
  color: "#475569",
  fontWeight: 700,
  border: "1.5px solid #fff",
});

const buildS3Url = (key?: string | null) => {
  if (!key) return null;
  return `${process.env.NEXT_PUBLIC_S3_BASE_URL}/${key}`;
};

function GroupFallbackAvatar({
  size,
  memberAvatarUrls = [],
}: {
  size: number;
  memberAvatarUrls?: (string | null | undefined)[];
}) {
  const validUrls = memberAvatarUrls.filter(Boolean) as string[];
  const displayUrls = validUrls.slice(0, 4);
  const count = displayUrls.length;

  if (count === 0) {
    return (
      <MuiAvatar
        sx={{
          width: size,
          height: size,
          fontWeight: 700,
          background: "#D1D5DB",
          color: "#475569",
        }}
      >
        G
      </MuiAvatar>
    );
  }

  if (count === 1) {
    return (
      <MuiAvatar
        src={displayUrls[0]}
        sx={{
          width: size,
          height: size,
        }}
      />
    );
  }

  // 2 avatar
  if (count === 2) {
    const miniSize = size * 0.62;

    return (
      <MuiAvatar
        sx={{
          width: size,
          height: size,
          background: "#fff",
          p: 0,
        }}
      >
        <GroupClusterWrap>
          <MiniAvatar
            src={displayUrls[0]}
            alt=""
            style={{
              width: miniSize,
              height: miniSize,
              left: size * 0.06,
              top: size * 0.18,
              zIndex: 2,
            }}
          />
          <MiniAvatar
            src={displayUrls[1]}
            alt=""
            style={{
              width: miniSize,
              height: miniSize,
              right: size * 0.06,
              bottom: size * 0.18,
              zIndex: 1,
            }}
          />
        </GroupClusterWrap>
      </MuiAvatar>
    );
  }

  // 3 avatar
  if (count === 3) {
    const miniSize = size * 0.5;

    return (
      <MuiAvatar
        sx={{
          width: size,
          height: size,
          background: "#fff",
          p: 0,
        }}
      >
        <GroupClusterWrap>
          <MiniAvatar
            src={displayUrls[0]}
            alt=""
            style={{
              width: miniSize,
              height: miniSize,
              left: size * 0.08,
              top: size * 0.08,
              zIndex: 3,
            }}
          />
          <MiniAvatar
            src={displayUrls[1]}
            alt=""
            style={{
              width: miniSize,
              height: miniSize,
              right: size * 0.08,
              top: size * 0.08,
              zIndex: 2,
            }}
          />
          <MiniAvatar
            src={displayUrls[2]}
            alt=""
            style={{
              width: miniSize,
              height: miniSize,
              left: "50%",
              bottom: size * 0.06,
              transform: "translateX(-50%)",
              zIndex: 1,
            }}
          />
        </GroupClusterWrap>
      </MuiAvatar>
    );
  }

  // 4 avatar trở lên -> kiểu Zalo gần giống: 4 avatar tròn trong 1 cụm
  const miniSize = size * 0.46;

  return (
    <MuiAvatar
      sx={{
        width: size,
        height: size,
        background: "#fff",
        p: 0,
      }}
    >
      <GroupClusterWrap>
        <MiniAvatar
          src={displayUrls[0]}
          alt=""
          style={{
            width: miniSize,
            height: miniSize,
            left: size * 0.05,
            top: size * 0.10,
            zIndex: 4,
          }}
        />
        <MiniAvatar
          src={displayUrls[1]}
          alt=""
          style={{
            width: miniSize,
            height: miniSize,
            right: size * 0.05,
            top: size * 0.05,
            zIndex: 3,
          }}
        />
        <MiniAvatar
          src={displayUrls[2]}
          alt=""
          style={{
            width: miniSize,
            height: miniSize,
            left: size * 0.08,
            bottom: size * 0.05,
            zIndex: 2,
          }}
        />
        {validUrls.length > 4 ? (
          <CountBadge
            sx={{
              width: miniSize,
              height: miniSize,
              right: size * 0.05,
              bottom: size * 0.08,
              fontSize: Math.max(9, size * 0.16),
              zIndex: 1,
            }}
          >
            +{validUrls.length - 3}
          </CountBadge>
        ) : (
          <MiniAvatar
            src={displayUrls[3]}
            alt=""
            style={{
              width: miniSize,
              height: miniSize,
              right: size * 0.05,
              bottom: size * 0.08,
              zIndex: 1,
            }}
          />
        )}
      </GroupClusterWrap>
    </MuiAvatar>
  );
}

export default function AppAvatar({
  src,
  name,
  size = 32,
  alt,
  sx,
  children,
  fontSize = 16,
  showNameFallback = true,
  isGroup = false,
  memberAvatarUrls = [],
  ...rest
}: AppAvatarProps) {
  const fallback = children || getInitialsName(name ?? "") || "A";

  if (isGroup && !src) {
    return (
      <GroupFallbackAvatar
        size={size}
        memberAvatarUrls={memberAvatarUrls}
      />
    );
  }

  return (
    <MuiAvatar
      src={src || undefined}
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
      {showNameFallback ? fallback : null}
    </MuiAvatar>
  );
}

export { buildS3Url };