"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Breadcrumbs,
  Link,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MovieIcon from "@mui/icons-material/Movie";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import axios from "axios";
import { cloudService } from "@/src/common/service/cloud-service";
import { getSessionToken } from "@/src/common/utilities/utils";
import { Trans } from "react-i18next";
import { useTrans } from "@/src/common/utilities/hook/trans";

/* ===================== styled components ===================== */

const Container = styled(Box)({
  display: "flex",
  height: "100%",
  width: "100%",
  backgroundColor: "#FFFFFF",
});

const SidebarSection = styled(Box)({
  width: 280,
  minWidth: 280,
  borderRight: "1px solid #EEF1F4",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#FFFFFF",
  "@media (max-width: 767px)": {
    width: "100%",
    minWidth: "unset",
    borderRight: "none",
    height: "100%",
  },
});

const SidebarHeader = styled(Box)({
  height: 68,
  minHeight: 68,
  borderBottom: "1px solid #EEF1F4",
  display: "flex",
  alignItems: "center",
  padding: "0 20px",
});

const ContentSection = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#F4F6F8",
  minWidth: 0,
  overflow: "hidden",
  "@media (max-width: 767px)": {
    width: "100%",
    height: "100%",
  },
});

const ContentHeader = styled(Box)({
  height: 68,
  minHeight: 68,
  borderBottom: "1px solid #EEF1F4",
  backgroundColor: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 24px",
});

const ContentBody = styled(Box)({
  flex: 1,
  padding: "24px",
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  minWidth: 0,
  "@media (max-width: 767px)": {
    padding: "12px",
    gap: "12px",
  },
});

const UploadZone = styled(Paper)<{ isDragActive?: boolean }>(({ isDragActive }) => ({
  border: "2px dashed #005AE0",
  borderRadius: "12px",
  padding: "24px 16px",
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: isDragActive ? "#E3F2FD" : "#FFFFFF",
  transition: "background-color 0.2s, border-color 0.2s",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  "&:hover": {
    backgroundColor: "#F5F9FF",
    borderColor: "#0048CC",
  },
}));

const FolderCard = styled(Card)({
  cursor: "pointer",
  borderRadius: "12px",
  boxShadow: "none",
  border: "1px solid #E5E7EB",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    borderColor: "#005AE0",
  },
});

interface CloudPanelProps {
  defaultView?: "all" | "folders";
}

export default function CloudPanel({ defaultView = "all" }: CloudPanelProps) {
  const t = useTrans();
  const isMobile = useMediaQuery("(max-width:767px)");
  const [mobileView, setMobileView] = useState<"list" | "content">("list");
  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Dialog state
  const [openNewFolder, setOpenNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // File Actions Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [openRename, setOpenRename] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, file: any) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedFile(file);
    setRenameValue(file.name);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleRenameSubmit = async () => {
    if (!renameValue.trim() || !selectedFile) return;
    // Check for duplicate name in the same folder
    const isDuplicate = files.some((f) => f.name === renameValue.trim() && f.id !== selectedFile.id);
    if (isDuplicate) {
      alert(t("CLOUD.RENAME_DUPLICATE_ALERT", { name: renameValue.trim() }));
      return;
    }
    const res = await cloudService.updateFile(selectedFile.id, { name: renameValue.trim() });
    if (res.ok) {
      setFiles((prev) =>
        prev.map((f) => (f.id === selectedFile.id ? { ...f, name: renameValue.trim() } : f))
      );
      setOpenRename(false);
      setSelectedFile(null);
      handleMenuClose();
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Folders & Files
  const loadData = useCallback(async () => {
    setLoading(true);
    const folderRes = await cloudService.getFolders();
    if (folderRes.ok) {
      setFolders(folderRes.data);
    }
    const fileRes = await cloudService.getFiles(currentFolder ? currentFolder.id : null);
    if (fileRes.ok) {
      setFiles(fileRes.data);
    }
    setLoading(false);
  }, [currentFolder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleRefresh = () => {
      loadData();
    };
    window.addEventListener("app:refresh_cloud", handleRefresh);
    return () => {
      window.removeEventListener("app:refresh_cloud", handleRefresh);
    };
  }, [loadData]);

  // Calculate storage used
  const totalStorageLimit = 1024 * 1024 * 1024; // 1 GB in bytes
  const totalSizeUsed = files.reduce((acc, f) => acc + Number(f.size || 0), 0);
  const sizePercentage = Math.min((totalSizeUsed / totalStorageLimit) * 100, 100);

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Create folder handler
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const res = await cloudService.createFolder(newFolderName.trim());
    if (res.ok) {
      setFolders((prev) => [...prev, res.data]);
      setNewFolderName("");
      setOpenNewFolder(false);
    }
  };

  // Delete folder handler
  const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t("CLOUD.DELETE_FOLDER_CONFIRM"))) {
      const res = await cloudService.deleteFolder(id);
      if (res.ok) {
        setFolders((prev) => prev.filter((f) => f.id !== id));
        if (currentFolder?.id === id) {
          setCurrentFolder(null);
        }
      }
    }
  };

  // Get sign signature and upload directly to Cloudinary
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (totalSizeUsed + file.size > totalStorageLimit) {
      alert(t("CLOUD.STORAGE_EXCEEDED"));
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    // Check for duplicate file name in the current folder
    const isDuplicate = files.some((f) => f.name === file.name);
    if (isDuplicate) {
      alert(t("CLOUD.UPLOAD_DUPLICATE_ALERT", { name: file.name }));
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const token = getSessionToken() || "";
      
      // 1. Request signed signature from backend gateway
      const signRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4321"}/api/media/cloudinary-sign`,
        { resourceType: file.type.startsWith("image/") ? "image" : "auto" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!signRes.data.success) {
        throw new Error("Failed to sign Cloudinary request");
      }

      setUploadProgress(30);
      const { apiKey, timestamp, signature, folder, cloudName } = signRes.data.data;

      // 2. Upload file directly to Cloudinary using FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${file.type.startsWith("image/") ? "image" : "auto"}/upload`;

      const uploadRes = await axios.post(cloudinaryUrl, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 50) / progressEvent.total) + 30;
            setUploadProgress(percent);
          }
        },
      });

      setUploadProgress(90);

      // 3. Register uploaded file details in our chat-service DB
      const regRes = await cloudService.registerFile({
        name: file.name,
        url: uploadRes.data.secure_url,
        mimeType: file.type,
        size: file.size,
        folderId: currentFolder ? currentFolder.id : null,
      });

      if (regRes.ok) {
        setFiles((prev) => [regRes.data, ...prev]);
      } else if (regRes.status === 409) {
        alert(t("CLOUD.FILE_EXISTS_ALERT", { name: file.name }));
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload file. Please verify Cloudinary credentials inside .env!");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Delete file handler
  const handleDeleteFile = async (id: string) => {
    if (confirm(t("CLOUD.DELETE_FILE_CONFIRM"))) {
      const res = await cloudService.deleteFile(id);
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
      }
    }
  };

  // Format MIME types into short human-readable extensions
  const getFormatType = (mimeType: string) => {
    if (!mimeType) return "FILE";
    if (mimeType.includes("wordprocessingml")) return "DOCX";
    if (mimeType.includes("spreadsheetml")) return "XLSX";
    if (mimeType.includes("presentationml")) return "PPTX";
    
    const parts = mimeType.split("/");
    const sub = parts[1] || parts[0];
    if (sub.length > 8) {
      return sub.split(".")[0]?.toUpperCase() || "FILE";
    }
    return sub.toUpperCase();
  };

  // Helper icons for files
  const getFileIcon = (mime: string) => {
    if (mime.startsWith("image/")) return <ImageIcon color="primary" />;
    if (mime.startsWith("video/")) return <MovieIcon color="secondary" />;
    if (mime === "application/pdf") return <PictureAsPdfIcon color="error" />;
    return <InsertDriveFileIcon color="action" />;
  };

  return (
    <Container>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      {/* Sidebar quota & controls */}
      {(!isMobile || mobileView === "list") && (
      <SidebarSection>
        {/* Sidebar Header matching Zalo 68px height */}
        <SidebarHeader>
          <Typography variant="h6" fontWeight={700} color="#081B3A">
            {t("CLOUD.MY_DRIVE")}
          </Typography>
        </SidebarHeader>

        {/* Sidebar Content area with custom padding and spacing */}
        <Box sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
          {/* Folders List inside Sidebar */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="#767A7F"
              sx={{ textTransform: "uppercase", letterSpacing: 0.5, px: 2, mb: 1 }}
            >
              {t("CLOUD.FOLDERS")}
            </Typography>
            
            {/* List of custom Folders */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {folders.map((f) => {
                const isSelected = currentFolder?.id === f.id;
                return (
                  <Box
                    key={f.id}
                    onClick={() => { setCurrentFolder(f); if (isMobile) setMobileView("content"); }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      py: "12px",
                      px: "16px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#E3F2FD" : "transparent",
                      color: isSelected ? "#0068FF" : "#5B6575",
                      fontWeight: isSelected ? 700 : 500,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: isSelected ? "#E3F2FD" : "#F3F5F7",
                      }
                    }}
                  >
                    <FolderIcon sx={{ color: isSelected ? "#0068FF" : "#FFC107", fontSize: 20 }} />
                    <Typography variant="body2" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteFolder(f.id, e)}
                      sx={{
                        color: "#E11D48",
                        padding: 0.5,
                        opacity: 0.4,
                        "&:hover": { opacity: 1, backgroundColor: "#FFF1F2" }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>

            {/* Plus button at the bottom of Folders list */}
            <Box
              onClick={() => setOpenNewFolder(true)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                py: "10px",
                px: "16px",
                borderRadius: "10px",
                border: "1px dashed #0068FF",
                cursor: "pointer",
                color: "#0068FF",
                fontWeight: 700,
                mt: 1.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#F0F6FF",
                }
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">{t("CLOUD.NEW_FOLDER")}</Typography>
            </Box>
          </Box>

          {/* Quota storage indicator at bottom */}
          <Box sx={{ mt: "auto", borderTop: "1px solid #EEF1F4", pt: 3 }}>
            <Typography variant="body2" fontWeight={700} color="#081B3A" mb={1}>
              {t("CLOUD.STORAGE_QUOTA")}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={sizePercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "#EEF1F4",
                "& .MuiLinearProgress-bar": { backgroundColor: "#0068FF", borderRadius: 4 },
              }}
            />
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              {t("CLOUD.STORAGE_USED", { used: formatSize(totalSizeUsed), total: formatSize(totalStorageLimit) })}
            </Typography>
          </Box>
        </Box>
      </SidebarSection>
      )}

      {/* Main dashboard content */}
      {(!isMobile || mobileView === "content") && (
      <ContentSection>
        {/* Navigation Breadcrumb & Dynamic Header Upload matching 68px height */}
        <ContentHeader>
          <Box display="flex" alignItems="center" gap={1}>
            {isMobile ? (
              <IconButton size="small" onClick={() => setMobileView("list")} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
            ) : currentFolder ? (
              <IconButton size="small" onClick={() => setCurrentFolder(null)} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
            ) : null}
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                underline="hover"
                color={currentFolder ? "text.secondary" : "text.primary"}
                onClick={() => setCurrentFolder(null)}
                sx={{ cursor: "pointer", fontWeight: !currentFolder ? 700 : 500, fontSize: 15 }}
              >
                {t("CLOUD.MY_DRIVE")}
              </Link>
              {currentFolder && (
                <Typography color="text.primary" fontWeight={700} sx={{ fontSize: 15 }}>
                  {currentFolder.name}
                </Typography>
              )}
            </Breadcrumbs>
          </Box>

          {currentFolder && (
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                backgroundColor: "#0068FF",
                borderRadius: "10px",
                py: 1,
                px: 3,
                textTransform: "none",
                fontSize: 13,
                fontWeight: 700,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#0052CC", boxShadow: "none" },
              }}
            >
              {t("CLOUD.UPLOAD_FILE")}
            </Button>
          )}
        </ContentHeader>

        {/* Dynamic Body content with breathing margins */}
        <ContentBody>
          {/* Upload progress */}
          {uploading && (
            <Box display="flex" flexDirection="column" gap={1} p={2.5} bgcolor="#E5F1FF" borderRadius="12px">
              <Typography variant="body2" fontWeight={700} color="#0068FF">
                {t("CLOUD.UPLOADING_FILE")}
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 6, borderRadius: 3, backgroundColor: "rgba(0,104,255,0.1)" }} />
            </Box>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Files Section */}
              <Box>
                {!currentFolder ? (
                  // Root Level UI: Must choose folder first (Premium elevated styling)
                  <Paper
                    elevation={0}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: { xs: 4, md: 12 },
                      px: { xs: 2, md: 4 },
                      border: "1px solid #EEF1F4",
                      borderRadius: "16px",
                      backgroundColor: "#FFFFFF",
                      textAlign: "center",
                      gap: 2,
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 60, md: 80 },
                        height: { xs: 60, md: 80 },
                        borderRadius: "50%",
                        backgroundColor: "#FFF9DB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1
                      }}
                    >
                      <FolderIcon sx={{ fontSize: { xs: 32, md: 40 }, color: "#FFC107" }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="#081B3A">
                      {t("CLOUD.SELECT_FOLDER_TITLE")}
                    </Typography>
                    <Typography variant="body2" color="#86909C" sx={{ maxWidth: 420, lineHeight: 1.6 }}>
                      {t("CLOUD.SELECT_FOLDER_DESC")}
                    </Typography>
                  </Paper>
                                ) : files.length === 0 ? (
                  // Selected Folder is Empty UI: Drag & Drop upload zone
                  <UploadZone onClick={() => fileInputRef.current?.click()} sx={{ py: { xs: 4, md: 10 }, border: "2px dashed #0068FF" }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: "#0068FF" }} />
                    <Typography variant="body1" fontWeight={700} color="#081B3A">
                      {t("CLOUD.UPLOAD_TO_FOLDER", { name: currentFolder.name })}
                    </Typography>
                    <Typography variant="body2" color="#86909C">
                      {t("CLOUD.DRAG_DROP_HINT")}
                    </Typography>
                  </UploadZone>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: "16px", border: "1px solid #EEF1F4", boxShadow: "0 8px 32px rgba(0,0,0,0.02)", overflow: "hidden", width: "100%" }}>
                    <Table sx={{ width: "100%", minWidth: { xs: 350, md: 500 } }}>
                      <TableHead sx={{ backgroundColor: "#F7F9FB" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, color: "#081B3A", width: "100%" }}>{t("CLOUD.COL_NAME")}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#081B3A", whiteSpace: "nowrap" }}>{t("CLOUD.COL_TYPE")}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#081B3A", whiteSpace: "nowrap" }}>{t("CLOUD.COL_SIZE")}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#081B3A", whiteSpace: "nowrap" }}>{t("CLOUD.COL_UPLOADED_AT")}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: "#081B3A", whiteSpace: "nowrap" }}>{t("CLOUD.COL_ACTIONS")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody sx={{ backgroundColor: "#FFFFFF" }}>
                        {files.map((file) => (
                          <TableRow key={file.id} hover>
                            <TableCell sx={{ py: "14px", width: "100%", maxWidth: 0 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                                <Box sx={{ flexShrink: 0, display: "flex" }}>{getFileIcon(file.mimeType)}</Box>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  color="#081B3A"
                                  noWrap
                                  title={file.name}
                                >
                                  {file.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                              <Typography variant="body2" color="#86909C">
                                {getFormatType(file.mimeType)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ whiteSpace: "nowrap" }}>{formatSize(file.size)}</TableCell>
                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                              {new Date(file.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                              {/* Inline buttons — visible on wide screens (md+) */}
                              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5, justifyContent: "center" }}>
                                <IconButton
                                  size="small"
                                  title={t("CLOUD.DOWNLOAD")}
                                  onClick={() => window.open(file.url, "_blank", "noopener,noreferrer")}
                                  sx={{ color: "#005AE0", "&:hover": { backgroundColor: "#E3F2FD" } }}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  title={t("CLOUD.RENAME")}
                                  onClick={() => { setSelectedFile(file); setRenameValue(file.name); setOpenRename(true); }}
                                  sx={{ color: "#FF9800", "&:hover": { backgroundColor: "#FFF8E1" } }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  title={t("CLOUD.DELETE")}
                                  onClick={() => handleDeleteFile(file.id)}
                                  sx={{ color: "#E11D48", "&:hover": { backgroundColor: "#FFF1F2" } }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              {/* Ellipsis menu — visible only on narrow screens (below md) */}
                              <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center" }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, file)}
                                  sx={{ color: "#5B6575", "&:hover": { backgroundColor: "#F3F5F7" } }}
                                >
                                  <MoreHorizIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </>
          )}
        </ContentBody>
      </ContentSection>
      )}

      {/* New Folder Dialog */}
      <Dialog open={openNewFolder} onClose={() => setOpenNewFolder(false)} PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#081B3A" }}>{t("CLOUD.NEW_FOLDER")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("CLOUD.FOLDER_NAME")}
            type="text"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenNewFolder(false)} sx={{ color: "#5B6575", fontWeight: 700 }}>
            {t("CLOUD.CANCEL")}
          </Button>
          <Button onClick={handleCreateFolder} variant="contained" sx={{ backgroundColor: "#0068FF", borderRadius: "10px", fontWeight: 700, boxShadow: "none", "&:hover": { backgroundColor: "#0052CC", boxShadow: "none" } }}>
            {t("CLOUD.CREATE")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Action Ellipsis Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl && document.body.contains(menuAnchorEl))}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid #EEF1F4",
            minWidth: 140,
          }
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedFile) {
              window.open(selectedFile.url, "_blank", "noopener,noreferrer");
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary={t("CLOUD.DOWNLOAD")} primaryTypographyProps={{ variant: "body2", fontWeight: 600 }} />
        </MenuItem>

        <MenuItem
          onClick={() => {
            setOpenRename(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: "#FF9800" }} />
          </ListItemIcon>
          <ListItemText primary={t("CLOUD.RENAME")} primaryTypographyProps={{ variant: "body2", fontWeight: 600 }} />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedFile) {
              handleDeleteFile(selectedFile.id);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "#E11D48" }} />
          </ListItemIcon>
          <ListItemText primary={t("CLOUD.DELETE")} primaryTypographyProps={{ variant: "body2", fontWeight: 600, color: "#E11D48" }} />
        </MenuItem>
      </Menu>

      {/* Rename File Dialog */}
      <Dialog open={openRename} onClose={() => setOpenRename(false)} PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#081B3A" }}>{t("CLOUD.RENAME_FILE")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("CLOUD.RENAME_NEW_NAME_LABEL")}
            type="text"
            fullWidth
            variant="outlined"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenRename(false)} sx={{ color: "#5B6575", fontWeight: 700 }}>
            {t("CLOUD.CANCEL")}
          </Button>
          <Button onClick={handleRenameSubmit} variant="contained" sx={{ backgroundColor: "#0068FF", borderRadius: "10px", fontWeight: 700, boxShadow: "none", "&:hover": { backgroundColor: "#0052CC", boxShadow: "none" } }}>
            {t("CLOUD.SAVE")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
