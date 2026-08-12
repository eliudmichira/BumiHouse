import React from 'react';
import { MapPin, DollarSign, Building2, User, Phone, CheckCircle, FileText, Image as ImageIcon, Layers } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const StepReview = ({ formData }) => {
    const { isDark } = useTheme();

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
            </div>
            <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#10121e]' : 'bg-white shadow-sm'}`}>
                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <CheckCircle className="w-6 h-6 text-[#51faaa]" /> Review Details
                </h2>

                <div className="space-y-6">
                    {/* Image Preview Carousel (Mini) */}
                    {formData.images && formData.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                            {/* Handle both File objects (previews) and URL strings */}
                            {formData.images.map((img, i) => {
                                const src = typeof img === 'string' ? img : (img.url || '');
                                if (!src) return null;
                                return (
                                    <img key={i} src={src} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" alt="" />
                                );
                            })}
                        </div>
                    )}
                    {(!formData.images || formData.images.length === 0) && (
                        <div className="p-4 rounded-xl border border-dashed flex items-center justify-center gap-2 text-gray-500 text-sm">
                            <ImageIcon className="w-4 h-4" /> No images added
                        </div>
                    )}

                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#1a1d2d]' : 'bg-gray-50'}`}>
                        <h3 className="font-bold mb-3 text-[#51faaa] text-sm uppercase tracking-wider">Property Info</h3>
                        <InfoRow icon={Building2} label="Title" value={formData.title} />
                        <InfoRow icon={Building2} label="Type" value={formData.propertyType} />
                        <InfoRow icon={DollarSign} label="Price" value={`KES ${Number(formData.price).toLocaleString()}`} />
                        <InfoRow icon={MapPin} label="Location" value={`${formData.location.city}, ${formData.location.address}`} />
                    </div>

                    {formData.hasMultipleUnits && formData.units?.length > 0 ? (
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-[#1a1d2d]' : 'bg-gray-50'}`}>
                            <h3 className="font-bold mb-3 text-[#51faaa] text-sm uppercase tracking-wider flex items-center gap-2">
                                <Layers className="w-4 h-4" /> Unit Configurations
                            </h3>
                            <div className="space-y-2">
                                {formData.units.map(unit => (
                                    <div key={unit.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{unit.name}</span>
                                        <span className="font-mono text-xs">{unit.bedrooms}b/{unit.bathrooms}b</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-[#1a1d2d]' : 'bg-gray-50'}`}>
                            <h3 className="font-bold mb-3 text-[#51faaa] text-sm uppercase tracking-wider">Details</h3>
                            <InfoRow icon={FileText} label="Bedrooms" value={formData.details.bedrooms} />
                            <InfoRow icon={FileText} label="Bathrooms" value={formData.details.bathrooms} />
                            <InfoRow icon={FileText} label="Area" value={`${formData.details.area} sqft`} />
                            <InfoRow icon={FileText} label="Parking" value={formData.details.parking} />
                        </div>
                    )}

                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#1a1d2d]' : 'bg-gray-50'}`}>
                        <h3 className="font-bold mb-3 text-[#51faaa] text-sm uppercase tracking-wider">Contact</h3>
                        <InfoRow icon={User} label="Name" value={formData.contact.name} />
                        <InfoRow icon={Phone} label="Phone" value={formData.contact.phone} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepReview;
