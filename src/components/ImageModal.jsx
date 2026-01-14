import React from "react";
import { X } from "lucide-react";

const ImageModal = ({ visible, imageUri, onClose }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
                <X size={24} className="text-white" />
            </button>

            {imageUri && (
                <img
                    src={imageUri}
                    alt="Full view"
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                    onError={(e) => {
                        alert("Failed to load image");
                        onClose();
                    }}
                />
            )}
        </div>
    );
};

export default ImageModal;
