const baseUrl = 'http://192.168.15.227:5000'

export const environment = {
  production: false,
  baseUrl : baseUrl,
  paths: {
    checkSessionActive: baseUrl + '/auth/check-session',
    logout: baseUrl + '/auth/logout',
    checkImg: baseUrl + '/employee/verify-img',

    adminLogin: baseUrl + '/auth/admin',

    getCamera: baseUrl + '/camera',
    adminUpdateCamera: baseUrl + '/camera/admin/update',
    getMemberAll: baseUrl + "/employee",
    getMemerByImage :baseUrl +"/employee/verify-face",


    getUniqueColumn: baseUrl + '/organization/unique-column',
    getMemberNumber: baseUrl + '/employee/number',
    getAllMember: baseUrl + '/employee',
    getAllDetection: baseUrl + '/detection',
    getDetectionSpecificMember: baseUrl + '/detection/user-detection',
    gettDetectionByImage: baseUrl + '/detection/search-by-image',
    getSpecificMember: baseUrl + '/employee/profile',
    getImageCapture: baseUrl + '/img-capture',
    getNearestImageCapture: baseUrl + '/img-capture/nearest',
    getEmotionGraph:baseUrl + '/detection/get-emotion-graph',
    getTransactionGraph:baseUrl + '/detection/get-transaction-graph',
    getAlert: baseUrl + '/facial-alert',
    getAlertDetection: baseUrl + '/facial-alert/alert-detection',
    getSpecificAlert: baseUrl + '/facial-alert/specific',
    getGreeting:baseUrl + '/greeting',

    createMember: baseUrl + '/employee/create',
    createEmbedded: baseUrl + '/embedded/create',
    createAlert: baseUrl + '/facial-alert/create',
    createGreeting: baseUrl + '/greeting/create',

    updateMember: baseUrl + '/employee/update',
    updateOrganization:baseUrl+"/organization/update",
    updateGreeting: baseUrl + '/greeting/update',

    deleteAlert: baseUrl + '/facial-alert/delete',
    deleteMember: baseUrl + '/employee/delete',
    deleteGreeting: baseUrl + '/greeting/delete',

    //==============================================================
    systemAdminLogin: baseUrl + "/auth/system-admin",

    getAllOrganization: baseUrl + "/organization/all",
    getOrganizationById: baseUrl + "/organization/specific",
    getOrganizationTransaction: baseUrl + "/detection/get-organization-transaction",

    createOrganization: baseUrl + "/organization/create",
    createCamera:baseUrl+"/camera/create",
    createUniqueColumn: baseUrl + '/organization/create/uniq-column',

    updatePassword: baseUrl + '/organization/update-password',
    updateUniqueColumn: baseUrl + '/organization/update-unique-column',
    systemAdminUpdateCamera: baseUrl + '/camera/system-admin/update',

    deleteUniqueColumn:baseUrl + '/organization/delete-unique-column'
  }
};
