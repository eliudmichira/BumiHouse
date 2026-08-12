import React from 'react';
import { Camera, Plus, X, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const StepMedia = ({ previewImages, handleImageUpload, removeImage }) => {
    const { isDark } = useTheme();

    return (
        <div className="space-y-6">
            <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#10121e]' : 'bg-white shadow-sm'}`}>
                <h2 className={`text-xl font-bold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Camera className="w-6 h-6 text-[#51faaa]" /> Property Images
                </h2>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Add distinct photos of your property. High quality images increase engagement.
                </p>

                {/* Main Upload Button */}
                <label className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all mb-6 ${isDark ? 'border-gray-700 bg-[#1a1d2d] hover:bg-[#252a40] hover:border-[#51faaa]/50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#51faaa]/50'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${isDark ? 'bg-[#51faaa]/10' : 'bg-[#51faaa]/10'}`}>
                        <Plus className="w-8 h-8 text-[#51faaa]" />
                    </div>
                    <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Tap to Upload</span>
                    <span className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Max 10 images, 5MB each</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {/* Image Grid */}
                {previewImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        {previewImages.map((img, i) => (
                            <div key={i} className="aspect-square relative rounded-xl overflow-hidden group border border-gray-200 dark:border-gray-700">
                                <img src={img.url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <button
                                    onClick={() => removeImage(i)}
                                    className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1.5 opacity-90 hover:opacity-100 transition-all transform hover:scale-110 shadow-lg"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                {i === 0 && (
                                    <span className="absolute bottom-1 left-1 bg-[#51faaa] text-[#0a0c19] text-[10px] font-bold px-1.5 py-0.5 rounded">
                                        Cover
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {previewImages.length === 0 && (
                    <div className={`flex flex-col items-center justify-center py-8 opacity-50 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <span className="text-sm">No images selected yet</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StepMedia;
