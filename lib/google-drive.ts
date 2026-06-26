import { drive_v3, google } from "googleapis";

export function getDriveClient(): drive_v3.Drive {
  const auth = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.drive({ version: "v3", auth });
}

export function nameToKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toUpperCase()
    .replace(/\s+/g, "_");
}

export async function getOrCreateFolder(
  drive: drive_v3.Drive,
  nameKey: string,
  parentId: string,
): Promise<string> {
  const escaped = nameKey.replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `name='${escaped}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: "files(id)",
  });
  if (res.data.files?.[0]?.id) return res.data.files[0].id;

  const created = await drive.files.create({
    requestBody: {
      name: nameKey,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });
  return created.data.id!;
}

export async function isFolderEmpty(
  drive: drive_v3.Drive,
  folderId: string,
): Promise<boolean> {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id)",
    pageSize: 1,
  });
  return (res.data.files?.length ?? 0) === 0;
}
