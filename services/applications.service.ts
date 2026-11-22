import {
  apiDelete,
  apiGetRaw,
  apiPatch,
  buildParams,
  toPage,
} from "@/lib/api";
import { normalizeApplication } from "@/lib/normalize";
import type { Application, ApplicationStatus, Page } from "@/types";

export interface ApplicationQuery {
  status?: ApplicationStatus | "";
  page?: number;
  limit?: number;
  search?: string;
  tuitionId?: string;
}

function mapPage(payload: unknown): Page<Application> {
  return toPage(payload, normalizeApplication);
}

export const applicationService = {
  async mine(query: ApplicationQuery = {}): Promise<Page<Application>> {
    const payload = await apiGetRaw("/applications/me", {
      params: buildParams({ ...query }),
    });

    return mapPage(payload);
  },

  async forTutor(query: ApplicationQuery = {}): Promise<Page<Application>> {
    const payload = await apiGetRaw("/applications/tutor", {
      params: buildParams({ ...query }),
    });

    return mapPage(payload);
  },

  async updateStatus(
    id: string,
    status: Extract<ApplicationStatus, "accepted" | "rejected">,
  ): Promise<Application> {
    const payload = await apiPatch<unknown>(`/applications/${id}/status`, {
      status,
    });

    return normalizeApplication(payload);
  },

  async cancel(id: string): Promise<void> {
    await apiDelete(`/applications/${id}`);
  },
};
