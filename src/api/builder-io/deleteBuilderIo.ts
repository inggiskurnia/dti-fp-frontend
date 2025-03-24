import axios from "axios";

const builderIoAssetsUrl = "https://builder.io/api/v1";

export function decodeBuilderAssetUrl(url: string): string {
  const prefix = "https://cdn.builder.io/api/v1/image/";
  if (!url.startsWith(prefix)) {
    throw new Error("URL does not start with the expected prefix.");
  }
  const encodedAssetPath = url.substring(prefix.length);
  const decodedAssetPath = decodeURIComponent(encodedAssetPath);

  return decodedAssetPath;
}

export const deleteAssetBuilderIo = async (
  url: string,
): Promise<BuilderIoResponse> => {
  const assetId = decodeBuilderAssetUrl(url);
  try {
    const response = await axios.delete<BuilderIoResponse>(
      `${builderIoAssetsUrl}/write/asset/${assetId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_BUILDER_IO_PRIVATE_KEY}`,
        },
      },
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting asset:", error);
    throw error;
  }
};
