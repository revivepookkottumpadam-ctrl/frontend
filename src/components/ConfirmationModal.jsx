import React from 'react';
import { AlertCircle, CheckCircle, X, HelpCircle } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    type = 'confirm', // 'confirm' (for deletes/actions) or 'alert' (for success/info)
    title,
    message,
    onConfirm,
    onClose,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
}) => {
    if (!isOpen) return null;

    const isAlert = type === 'alert' || type === 'success' || type === 'error';
    const isSuccess = type === 'success';
    const isError = type === 'error';
    const isConfirm = type === 'confirm';

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={isAlert ? onClose : undefined}
            />

            {/* Modal Content */}
            <div className="relative bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 border border-gray-700">

                {/* Header Icon */}
                <div className={`flex items-center justify-center py-6 ${isSuccess ? 'bg-green-600/20' :
                        isError ? 'bg-red-600/20' :
                            isConfirm ? 'bg-red-600/10' :
                                'bg-blue-600/20'
                    }`}>
                    <div className={`p-4 rounded-full ${isSuccess ? 'bg-green-600 text-white' :
                            isError ? 'bg-red-600 text-white' :
                                isConfirm ? 'bg-red-600 text-white' :
                                    'bg-blue-600 text-white'
                        } shadow-lg`}>
                        {isSuccess ? <CheckCircle size={32} /> :
                            isError ? <AlertCircle size={32} /> :
                                isConfirm ? <HelpCircle size={32} /> :
                                    <AlertCircle size={32} />}
                    </div>
                </div>

                {/* Close Button (Absolute) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700/50 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 p-6 pt-0">
                    {isAlert ? (
                        <button
                            onClick={onClose}
                            className="col-span-2 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
                        >
                            Close
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onClose}
                                className="py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg"
                            >
                                {confirmText}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
