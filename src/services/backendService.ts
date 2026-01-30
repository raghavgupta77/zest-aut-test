/**
 * Backend Service
 * Exact React replacement for Angular BackendService
 * Handles all HTTP requests with proper URL encoding (replaces $.param())
 */

import { environment, getEnvironmentConfig } from "../config/environment";
import { urlEncodeParams } from "../utils/helpers";

export class BackendService {
  /**
   * Set headers for requests
   * EXACT match for Angular setHeaders() method
   */
  private setHeaders(
    urlEncoded: boolean,
    addTokenHeader?: string | null,
    bearerToken?: any,
    _isBearerToken: boolean = false,
  ): HeadersInit {
    const headers: Record<string, string> = {};

    if (urlEncoded) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    } else {
      headers["Content-Type"] = "application/json";
      headers["Accept"] = "application/json";
    }

    if (addTokenHeader && addTokenHeader.length > 0) {
      headers["token"] = addTokenHeader;
    }

    if (bearerToken) {
      headers["Authorization"] =
        `${bearerToken.token_type} ${bearerToken.access_token}`;
    }

    headers["Cache-Control"] = "no-cache";
    headers["Pragma"] = "no-cache";

    return headers;
  }

  /**
   * Set headers with only Content-Type
   */
  private setHeadersOnlyContentType(): HeadersInit {
    return {
      "Content-Type": "application/json",
    };
  }

  /**
   * POST request (replaces setData)
   * EXACT match for Angular setData() method
   * Uses URLSearchParams instead of $.param()
   */
  async setData(
    environmentType: string,
    url: string,
    postParams: any = {},
    urlEncoded: boolean,
    addTokenHeader: string | null,
    isBucket: boolean,
    isAbsolute: boolean,
  ): Promise<any> {
    const requestUrl = isBucket
      ? `${this.getS3Url(environmentType)}${url}`
      : isAbsolute
        ? url
        : `${this.getBaseUrl(environmentType)}${url}`;

    let body: string;
    if (urlEncoded) {
      // Replace $.param() with URLSearchParams - same behavior
      body = urlEncodeParams(postParams);
    } else {
      body = JSON.stringify(postParams);
    }

    const headers = !isAbsolute
      ? this.setHeaders(urlEncoded, addTokenHeader)
      : this.setHeadersOnlyContentType();

    const response = await fetch(requestUrl, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();

      // Parse error response to match Angular's HttpErrorResponse.error structure
      let errorBody: any = null;
      try {
        errorBody = JSON.parse(errorText);
      } catch {
        errorBody = { message: errorText };
      }

      // Create error object matching Angular's HttpErrorResponse structure
      // This is critical for checkIfErrorCodeRetured() to work correctly
      const httpError: any = new Error(
        `HTTP error! status: ${response.status}`,
      );
      httpError.status = response.status;
      httpError.error = errorBody; // This matches Angular's HttpErrorResponse.error
      throw httpError;
    }

    return response.json();
  }

  /**
   * PUT request (replaces putData)
   */
  async putData(
    environmentType: string,
    url: string,
    postParams: any = {},
    urlEncoded: boolean,
    addTokenHeader: string | null,
    isBucket: boolean,
  ): Promise<any> {
    const requestUrl = isBucket
      ? `${this.getS3Url(environmentType)}${url}`
      : `${this.getBaseUrl(environmentType)}${url}`;

    let body: string;
    if (urlEncoded) {
      body = urlEncodeParams(postParams);
    } else {
      body = JSON.stringify(postParams);
    }

    const response = await fetch(requestUrl, {
      method: "PUT",
      headers: this.setHeaders(urlEncoded, addTokenHeader),
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorBody: any = null;
      try {
        errorBody = JSON.parse(errorText);
      } catch {
        errorBody = { message: errorText };
      }
      const httpError: any = new Error(
        `HTTP error! status: ${response.status}`,
      );
      httpError.status = response.status;
      httpError.error = errorBody;
      throw httpError;
    }

    return response.json();
  }

  /**
   * PUT request to app URL (replaces putAppData)
   */
  async putAppData(
    environmentType: string,
    url: string,
    postParams: any = {},
    urlEncoded: boolean,
    addTokenHeader: any,
    isBucket: boolean,
  ): Promise<any> {
    const requestUrl = isBucket
      ? `${this.getS3Url(environmentType)}${url}`
      : `${this.getBaseAppUrl(environmentType)}${url}`;

    let body: string;
    if (urlEncoded) {
      body = urlEncodeParams(postParams);
    } else {
      body = JSON.stringify(postParams);
    }

    const response = await fetch(requestUrl, {
      method: "PUT",
      headers: this.setHeaders(urlEncoded, null, addTokenHeader, true),
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorBody: any = null;
      try {
        errorBody = JSON.parse(errorText);
      } catch {
        errorBody = { message: errorText };
      }
      const httpError: any = new Error(
        `HTTP error! status: ${response.status}`,
      );
      httpError.status = response.status;
      httpError.error = errorBody;
      throw httpError;
    }

    return response.json();
  }

  /**
   * GET request (replaces getData)
   */
  async getData(
    environmentType: string,
    url: string = "",
    urlEncoded: boolean,
    addTokenHeader: string | null,
    isBucket: boolean,
  ): Promise<any> {
    const requestUrl = isBucket
      ? `${this.getS3Url(environmentType)}${url}`
      : `${this.getBaseUrl(environmentType)}${url}`;

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: this.setHeaders(urlEncoded, addTokenHeader),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorBody: any = null;
      try {
        errorBody = JSON.parse(errorText);
      } catch {
        errorBody = { message: errorText };
      }
      const httpError: any = new Error(
        `HTTP error! status: ${response.status}`,
      );
      httpError.status = response.status;
      httpError.error = errorBody;
      throw httpError;
    }

    return response.json();
  }

  /**
   * Get base URL for environment
   * Uses Angular environment config directly
   */
  getBaseUrl(environmentType: string): string {
    const config = getEnvironmentConfig(environmentType);
    return config.baseUrl;
  }

  /**
   * Get base app URL for environment
   */
  getBaseAppUrl(environmentType: string): string {
    const config = getEnvironmentConfig(environmentType);
    return config.baseAppUrl;
  }

  /**
   * Get S3 URL for environment
   */
  getS3Url(environmentType: string): string {
    const config = getEnvironmentConfig(environmentType);
    return config.s3Url;
  }

  /**
   * Get base funnel URL for environment
   */
  getBaseFunnelUrl(environmentType: string): string {
    const config = getEnvironmentConfig(environmentType);
    return config.funnelUrl;
  }
}

// Export singleton instance for easy use
export const backendService = new BackendService();
