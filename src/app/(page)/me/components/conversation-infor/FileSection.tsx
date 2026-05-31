"use client";

import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SectionBlock from "./SectionBlock";
import { AttachmentDto } from "@/src/common/interface/chat-interface";
import { useTrans } from "@/src/common/utilities/hook/trans";


interface FileSectionProps {
    items: AttachmentDto[];
}

const EmptyHint = styled(Typography)({
    padding: "0 16px 16px",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 1.6,
    color: "#64748B",
});

const ItemList = styled(Box)({
    padding: "0 20px 16px",
});

const ItemRow = styled("a")({
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 0",
    textDecoration: "none",
    cursor: "pointer",
    "&:hover": {
        "& .file-title": {
            color: "#0068FF",
            textDecoration: "underline",
        }
    }
});

const ItemContent = styled(Box)({
    minWidth: 0,
    flex: 1,
});

const ItemTitle = styled(Typography)({
    fontSize: 14,
    color: "#0F172A",
    wordBreak: "break-word",
    fontFamily: "inherit",
});

const ItemSub = styled(Typography)({
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
});

export default function FileSection({ items }: FileSectionProps) {
    const t = useTrans();
    const formatFileSize = (size?: number) => {
        if (!size || Number.isNaN(size)) return "";
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
    return (
        <SectionBlock title={t("CONVO.FILE_TITLE")} defaultOpen>
            {items.length > 0 ? (
                <ItemList>
                    {items.slice(0, 6).map((file) => (
                        <ItemRow key={file.key || file.name} href={file.url} target="_blank" rel="noopener noreferrer">
                            <DescriptionOutlinedIcon sx={{ color: "#0068FF", mt: "2px" }} />
                            <ItemContent>
                                <ItemTitle className="file-title">{file.name}</ItemTitle>
                                <ItemSub>{formatFileSize(file.size)}</ItemSub>
                            </ItemContent>
                        </ItemRow>
                    ))}
                </ItemList>
            ) : (
                <EmptyHint>{t("CONVO.FILE_EMPTY")}</EmptyHint>
            )}
        </SectionBlock>
    );
}