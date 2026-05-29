import http from "../api/http";
import { API } from "../api/path";
import type { IApiResponse } from "../interface/auth-interface";

export const cloudService = {
  async getFolders() {
    const res = await http.get<IApiResponse<any[]>>(API.API_CLOUD_FOLDERS);
    if (res.ok) return { ok: true, data: res.payload?.data ?? [] };
    return { ok: false, data: [] };
  },

  async createFolder(name: string) {
    const res = await http.post<IApiResponse<any>>(API.API_CLOUD_FOLDERS, { name });
    if (res.ok) return { ok: true, data: res.payload?.data };
    return { ok: false };
  },

  async deleteFolder(id: string) {
    const res = await http.delete(API.API_CLOUD_FOLDER(id));
    return { ok: res.ok };
  },

  async getFiles(folderId: string | null) {
    const url = folderId
      ? `${API.API_CLOUD_FILES}?folderId=${folderId}`
      : API.API_CLOUD_FILES;
    const res = await http.get<IApiResponse<any[]>>(url);
    if (res.ok) return { ok: true, data: res.payload?.data ?? [] };
    return { ok: false, data: [] };
  },

  async registerFile(fileData: { name: string; url: string; mimeType: string; size: number; folderId?: string | null }) {
    const res = await http.post<IApiResponse<any>>(API.API_CLOUD_FILES, fileData);
    if (res.ok) return { ok: true, data: res.payload?.data, status: res.statusCode };
    return { ok: false, status: res.statusCode };
  },

  async deleteFile(id: string) {
    const res = await http.delete(API.API_CLOUD_FILE(id));
    return { ok: res.ok, status: res.statusCode };
  },

  async updateFile(id: string, updateData: { name: string }) {
    const res = await http.patch<IApiResponse<any>>(API.API_CLOUD_FILE(id), updateData);
    if (res.ok) return { ok: true, data: res.payload?.data, status: res.statusCode };
    return { ok: false, status: res.statusCode };
  },
};
