"use client";

import { Box, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import AudioFileOutlinedIcon from "@mui/icons-material/AudioFileOutlined";

interface FileAttachmentCardProps {
  attachment: {
    name: string;
    size: number;
    type: string;
    url?: string;
    contentType?: string;
  };
  isOwn?: boolean;
}

const FileCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isOwn",
})<{ isOwn?: boolean }>(({ isOwn }) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 12px",
  borderRadius: 10,
  background: isOwn ? "rgba(0, 0, 0, 0.04)" : "#F8FAFC",
  border: `1px solid ${isOwn ? "rgba(0, 0, 0, 0.08)" : "#E2E8F0"}`,
  cursor: "pointer",
  transition: "all 0.15s ease",
  maxWidth: 280,
  "&:hover": {
    background: isOwn ? "rgba(0, 0, 0, 0.07)" : "#F1F5F9",
  },
}));

const FileIconBox = styled(Box)({
  width: 36,
  height: 36,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

const FileInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const FileName = styled(Typography)({
  fontSize: 13,
  fontWeight: 500,
  color: "#1E293B",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const FileMeta = styled(Typography)({
  fontSize: 11,
  color: "#94A3B8",
  marginTop: 1,
});

const DownloadBtn = styled(IconButton)({
  width: 28,
  height: 28,
  minWidth: 28,
  color: "#64748B",
  "&:hover": {
    background: "rgba(0, 0, 0, 0.06)",
    color: "#005AE0",
  },
});

const getFileIcon = (name: string, type: string, contentType?: string) => {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const ct = (contentType || "").toLowerCase();

  if (ext === "pdf" || ct.includes("pdf")) {
    return { icon: <PictureAsPdfOutlinedIcon sx={{ fontSize: 20, color: "#EF4444" }} />, bg: "#FEF2F2" };
  }
  if (["doc", "docx"].includes(ext) || ct.includes("word") || ct.includes("document")) {
    return { icon: <DescriptionOutlinedIcon sx={{ fontSize: 20, color: "#3B82F6" }} />, bg: "#EFF6FF" };
  }
  if (["xls", "xlsx", "csv"].includes(ext) || ct.includes("excel") || ct.includes("spreadsheet")) {
    return { icon: <TableChartOutlinedIcon sx={{ fontSize: 20, color: "#10B981" }} />, bg: "#ECFDF5" };
  }
  if (["ppt", "pptx"].includes(ext) || ct.includes("presentation") || ct.includes("powerpoint")) {
    return { icon: <SlideshowOutlinedIcon sx={{ fontSize: 20, color: "#F59E0B" }} />, bg: "#FFFBEB" };
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext) || ct.includes("zip") || ct.includes("compressed")) {
    return { icon: <FolderZipOutlinedIcon sx={{ fontSize: 20, color: "#8B5CF6" }} />, bg: "#F5F3FF" };
  }
  if (type === "audio" || ct.startsWith("audio/")) {
    return { icon: <AudioFileOutlinedIcon sx={{ fontSize: 20, color: "#EC4899" }} />, bg: "#FDF2F8" };
  }
  return { icon: <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: "#64748B" }} />, bg: "#F1F5F9" };
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileExtension = (name: string): string => {
  return name.split(".").pop()?.toUpperCase() || "FILE";
};

export default function FileAttachmentCard({ attachment, isOwn }: FileAttachmentCardProps) {
  const { icon, bg } = getFileIcon(attachment.name, attachment.type, attachment.contentType);
  const ext = getFileExtension(attachment.name);

  const handleDownload = () => {
    const fileUrl = attachment.url;
    if (!fileUrl) {
      console.warn('[FileAttachmentCard] No URL for file:', attachment.name);
      return;
    }
    console.log('[FileAttachmentCard] Downloading:', fileUrl);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <FileCard isOwn={isOwn} onClick={handleDownload}>
      <FileIconBox sx={{ background: bg }}>{icon}</FileIconBox>
      <FileInfo>
        <FileName>{attachment.name}</FileName>
        <FileMeta>{formatFileSize(attachment.size)} • {ext}</FileMeta>
      </FileInfo>
      <DownloadBtn size="small" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
        <DownloadRoundedIcon sx={{ fontSize: 16 }} />
      </DownloadBtn>
    </FileCard>
  );
}
