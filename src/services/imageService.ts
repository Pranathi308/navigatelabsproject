"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "firebase/firestore";

export interface ImageHistoryItem {
    id: string;
    prompt: string;
    imageUrl: string;
    createdAt: Date;
}

export async function addImageToHistory(prompt: string, imageUrl: string): Promise<void> {
    try {
        await addDoc(collection(db, "generatedImages"), {
            prompt,
            imageUrl,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding image to history:", error);
        // We might not want to bother the user with this error,
        // but logging it is important.
        throw new Error("Could not save image to history.");
    }
}

export async function getImageHistory(): Promise<ImageHistoryItem[]> {
    try {
        const q = query(collection(db, "generatedImages"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const history: ImageHistoryItem[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            history.push({
                id: doc.id,
                prompt: data.prompt,
                imageUrl: data.imageUrl,
                createdAt: data.createdAt?.toDate(),
            });
        });
        return history;
    } catch (error) {
        console.error("Error fetching image history:", error);
        throw new Error("Could not fetch image history.");
    }
}
