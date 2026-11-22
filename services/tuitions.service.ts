import {
  apiDelete,
  apiGet,
  apiGetRaw,
  apiPatch,
  apiPost,
  buildParams,
  toItems,
  toPage,
} from "@/lib/api";
import { normalizeTuition } from "@/lib/normalize";
import type { Page, Tuition, TuitionInput } from "@/types";

export interface TuitionQuery {
  search?: string;
  subject?: string;
  classLevel?: string;
  mode?: string;
  location?: string;
  minFee?: number;
  maxFee?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface TutorTuitionQuery extends TuitionQuery {
  status?: string;
  isActive?: boolean;
}

function mapPage(payload: unknown): Page<Tuition> {
  return toPage(payload, normalizeTuition);
}

export const tuitionService = {
  async list(query: TuitionQuery = {}): Promise<Page<Tuition>> {
    const payload = await apiGetRaw("/tuitions", {
      params: buildParams({ ...query }),
    });

    return mapPage(payload);
  },

  async featured(limit = 3): Promise<Tuition[]> {
    const payload = await apiGetRaw("/tuitions/featured", {
      params: buildParams({ limit }),
    });

    return toItems(payload, normalizeTuition).slice(0, limit);
  },

  async getById(id: string): Promise<Tuition> {
    const payload = await apiGet<unknown>(`/tuitions/${id}`);
    return normalizeTuition(payload);
  },

  async mine(query: TutorTuitionQuery = {}): Promise<Page<Tuition>> {
    const payload = await apiGetRaw("/tuitions/mine", {
      params: buildParams({ ...query }),
    });

    return mapPage(payload);
  },

  async create(input: TuitionInput): Promise<Tuition> {
    const payload = await apiPost<unknown>("/tuitions", input);
    return normalizeTuition(payload);
  },

  async update(id: string, input: Partial<TuitionInput>): Promise<Tuition> {
    const payload = await apiPatch<unknown>(`/tuitions/${id}`, input);
    return normalizeTuition(payload);
  },

  async remove(id: string): Promise<void> {
    await apiDelete(`/tuitions/${id}`);
  },

  async setActive(id: string, isActive: boolean): Promise<Tuition> {
    const payload = await apiPatch<unknown>(`/tuitions/${id}`, { isActive });
    return normalizeTuition(payload);
  },

  async apply(id: string, message?: string): Promise<unknown> {
    return apiPost(`/tuitions/${id}/apply`, {
      ...(message?.trim() ? { message: message.trim() } : {}),
    });
  },
};
