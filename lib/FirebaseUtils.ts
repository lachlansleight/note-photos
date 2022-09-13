import { getDownloadURL, getStorage, uploadBytes, ref, deleteObject } from "firebase/storage";

const FirebaseUtils = {
    uploadBytes: async (file: File | Blob | Uint8Array, path: string): Promise<string> => {
        const storage = getStorage();
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        return url;
    },
    deleteFile: async (path: string): Promise<void> => {
        const storage = getStorage();
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
    },
};

export default FirebaseUtils;
