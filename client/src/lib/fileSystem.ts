import { apiRequest } from "./queryClient";

export async function readFile(path: string): Promise<string> {
  const response = await apiRequest("GET", `/api/files/content?path=${encodeURIComponent(path)}`);
  return await response.text();
}

export async function writeFile(path: string, content: string): Promise<void> {
  await apiRequest("POST", `/api/files/content`, {
    path,
    content
  });
}

export async function getFileTree(): Promise<any> {
  const response = await apiRequest("GET", "/api/files");
  return await response.json();
}
