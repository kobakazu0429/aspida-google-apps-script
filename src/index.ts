import type {
  AspidaClient,
  HttpMethod,
  AspidaParams,
  RequestType,
  BasicHeaders,
  AspidaRequest,
} from "aspida";
export type { AspidaClient, BasicHeaders } from "aspida";

// -------------
// from: https://github.com/aspida/aspida/blob/4c74918ece72d5b440dc897d915c5cbbedb0120f/packages/aspida/src/index.ts
// under MIT Licence
// may have side effects...
const encode = (str: Parameters<typeof encodeURIComponent>[0]) =>
  encodeURIComponent(str).replace(
    /[!'()~]|%20|%00/g,
    (match) =>
      ((
        {
          "!": "%21",
          "'": "%27",
          "(": "%28",
          ")": "%29",
          "~": "%7E",
          "%20": "+",
          "%00": "\x00",
        } as Record<string, string>
      )[match])
  );

export const dataToURLString = (data: Record<string, any>) =>
  Object.keys(data)
    .filter((key) => data[key] != null)
    .map((key) =>
      Array.isArray(data[key])
        ? data[key].map((v: string) => `${encode(key)}=${encode(v)}`).join("&")
        : `${encode(key)}=${encode(data[key])}`
    )
    .join("&");

export const optionToRequest = (
  option?: AspidaParams,
  type?: RequestType
): AspidaRequest | undefined => {
  if (option?.body === undefined) return option;

  const httpBody = JSON.stringify(option.body);
  const headers: BasicHeaders = {
    "Content-Type": "application/json;charset=utf-8",
  };

  return { httpBody, ...option, headers: { ...headers, ...option.headers } };
};

// -------------

type Response = GoogleAppsScript.URL_Fetch.HTTPResponse;
type Request = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

export type FetchConfig = Request & {
  baseURL?: string;
};

export default (
  client = UrlFetchApp.fetch,
  config?: FetchConfig
): AspidaClient<FetchConfig> => ({
  baseURL: config?.baseURL,
  fetch(
    baseURL: string,
    url: string,
    method: HttpMethod,
    params?: AspidaParams<FetchConfig>,
    type?: RequestType
  ) {
    const send =
      <V>(fn: (res: Response) => Promise<V>) =>
      async () => {
        const request = optionToRequest(params, type);
        const serializer = dataToURLString;
        const res = client(
          `${request?.config?.baseURL ?? baseURL}${url}${
            request?.query ? `?${serializer(request.query)}` : ""
          }`,
          {
            method,
            ...config,
            ...request?.config,
            body: request?.httpBody,
            headers: {
              ...config?.headers,
              ...request?.config?.headers,
              ...request?.headers,
            },
          }
        );

        const statusCode = res.getResponseCode();
        const headers = res.getAllHeaders();
        return {
          status: statusCode,
          headers,
          originalResponse: res,
          body: fn(res),
        };
      };

    return {
      send: send(() => Promise.resolve()),
      json: send((res) => JSON.parse(res.getContentText())),
      text: send((res) => res.getContentText() as any),
      arrayBuffer: send((res) => res.getContent() as any),
      blob: send((res) => res.getBlob() as any),
      formData: send((res) => JSON.parse(res.getContentText())),
    } as any;
  },
});