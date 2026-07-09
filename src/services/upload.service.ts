import { Platform } from 'react-native';
import apiClient from './api/apiClient';
import Upload, { UploadOptions } from 'react-native-background-upload';
import { API_CONFIG } from '../config/api.config';
import {
  ClipUrlRequest,
  ClipUrlResponse,
  FaceUrlRequest,
  FaceUrlResponse,
  ProfileImageUrlResponse,
  SessionConfigRequest,
  SessionConfigResponse,
  StumpDetectionUrlRequest,
  StumpDetectionUrlResponse,
} from '../types/upload';

export const uploadService = {
  getClipUrls: async (data: ClipUrlRequest): Promise<ClipUrlResponse> => {
    try {
      const response = await apiClient.post<ClipUrlResponse>(
        API_CONFIG.ENDPOINTS.UPLOAD_CLIP_URLS,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('Upload Service Error (getClipUrls):', error);
      throw error;
    }
  },

  configSession: async (
    id: string,
    data: SessionConfigRequest,
  ): Promise<SessionConfigResponse> => {
    try {
      console.log(
        '[UploadService] Uploading session config for session:',
        id,
        JSON.stringify(data),
      );
      const response = await apiClient.post<SessionConfigResponse>(
        API_CONFIG.ENDPOINTS.SESSION_CONFIG(id),
        data,
      );
      console.log(
        '[UploadService] Session config uploaded successfully:',
        JSON.stringify(response.data),
      );
      return response.data;
    } catch (error) {
      console.error('Upload Service Error (configSession):', error);
      throw error;
    }
  },

  getFaceUploadUrls: async (data: FaceUrlRequest): Promise<FaceUrlResponse> => {
    try {
      console.log(
        '[UploadService] Fetching face upload URLs with payload:',
        JSON.stringify(data),
      );
      const response = await apiClient.post<FaceUrlResponse>(
        API_CONFIG.ENDPOINTS.UPLOAD_FACE_URLS,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.error('Upload Service Error (getFaceUploadUrls):', error);
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
      }
      throw error;
    }
  },

  getProfileImageUploadUrl: async (): Promise<ProfileImageUrlResponse> => {
    try {
      const response = await apiClient.post<ProfileImageUrlResponse>(
        API_CONFIG.ENDPOINTS.UPLOAD_PROFILE_IMAGE_URL,
      );
      return response.data;
    } catch (error) {
      console.error('Upload Service Error (getProfileImageUploadUrl):', error);
      throw error;
    }
  },

  getStumpDetectionUploadUrl: async (
    data: StumpDetectionUrlRequest,
  ): Promise<StumpDetectionUrlResponse> => {
    try {
      const response = await apiClient.post<StumpDetectionUrlResponse>(
        API_CONFIG.ENDPOINTS.UPLOAD_STUMP_DETECTION_URL,
        data,
      );
      return response.data;
    } catch (error) {
      console.error(
        'Upload Service Error (getStumpDetectionUploadUrl):',
        error,
      );
      throw error;
    }
  },

  uploadFileToS3: async (
    url: string,
    filePath: string,
    contentType?: string,
  ): Promise<void> => {
    let uploadPath = filePath;
    if (Platform.OS === 'ios') {
      if (!uploadPath.startsWith('file://')) {
        uploadPath = `file://${uploadPath}`;
      }
    } else if (Platform.OS === 'android') {
      if (uploadPath.startsWith('file://')) {
        uploadPath = uploadPath.replace('file://', '');
      }
    }
    return new Promise((resolve, reject) => {
      const options: UploadOptions = {
        url,
        path: uploadPath,
        method: 'PUT',
        type: 'raw',
        headers: contentType ? { 'Content-Type': contentType } : {},
      };

      Upload.startUpload(options)
        .then(uploadId => {
          const completedSub = Upload.addListener(
            'completed',
            uploadId,
            data => {
              completedSub.remove();
              errorSub.remove();
              cancelledSub.remove();
              if (data.responseCode >= 200 && data.responseCode < 300) {
                console.log(`[UploadService] Upload completed: ${filePath}`);
                resolve();
              } else {
                console.error(
                  `[UploadService] S3 rejected upload (${data.responseCode}): ${data.responseBody}`,
                );
                reject(
                  new Error(
                    `S3 upload failed with status ${data.responseCode}: ${data.responseBody}`,
                  ),
                );
              }
            },
          );
          const errorSub = Upload.addListener('error', uploadId, data => {
            completedSub.remove();
            errorSub.remove();
            cancelledSub.remove();
            console.error(
              `[UploadService] Upload error: ${filePath}`,
              data.error,
            );
            reject(new Error(data.error));
          });
          const cancelledSub = Upload.addListener('cancelled', uploadId, () => {
            completedSub.remove();
            errorSub.remove();
            cancelledSub.remove();
            console.warn(`[UploadService] Upload cancelled: ${filePath}`);
            reject(new Error('Upload cancelled'));
          });
        })
        .catch(err => {
          console.error(
            `[UploadService] Failed to start upload: ${filePath}`,
            err,
          );
          reject(err);
        });
    });
  },
};
