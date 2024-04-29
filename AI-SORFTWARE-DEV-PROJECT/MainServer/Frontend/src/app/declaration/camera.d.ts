declare interface cameraInterface {
    cameraId?: string;
    cameraName?: string;
    cameraDetail?: string
    cameraSpec?: string;
    dateInstall?: string;
    status?: 'Active' | 'Disable';
    organization?: {
        organizationId?: string,
        organizationName?: string
    }
    organizationId?: string;
    organizationName?: string;
}