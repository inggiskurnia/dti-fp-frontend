import axios from "axios";

const builderIoUrl = `${process.env.NEXT_PUBLIC_BUILDER_IO_API_URL}`;

export const postFileBuilderIo = async ({
  name,
  altText,
  folder,
  file,
}: BuilderIoParams): Promise<BuilderIoResponse> => {
  const response = await axios.post<BuilderIoResponse>(builderIoUrl, file, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_BUILDER_IO_PRIVATE_KEY}`,
      "Content-Type": file.type,
    },
    params: {
      name,
      altText,
      folder,
    },
  });
  return response.data;
};
