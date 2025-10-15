import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Camera } from "lucide-react";

const PhotoGallery = ({ photos }) => {
	const [selectedImage, setSelectedImage] = useState(null);
	const [currentIndex, setCurrentIndex] = useState(0);

	const openImage = (index) => {
		setSelectedImage(photos[index]);
		setCurrentIndex(index);
	};

	const closeImage = () => {
		setSelectedImage(null);
	};

	const navigateImage = (direction) => {
		let newIndex;
		if (direction === "prev") {
			newIndex = (currentIndex - 1 + photos.length) % photos.length;
		} else {
			newIndex = (currentIndex + 1) % photos.length;
		}
		setSelectedImage(photos[newIndex]);
		setCurrentIndex(newIndex);
	};

	return (
		<div className="bg-white rounded-lg shadow-sm p-6">
			<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<Camera className="w-5 h-5" />
				Photos
			</h2>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{photos.map((photo, index) => (
					<div
						key={index}
						className="cursor-pointer hover:opacity-90 transition-opacity"
						onClick={() => openImage(index)}
					>
						<img
							src={photo}
							alt={`Clinic photo ${index + 1}`}
							className="w-full h-32 object-cover rounded-lg"
						/>
					</div>
				))}
			</div>

			{/* Image Modal */}
			{selectedImage && (
				<div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
					<button
						onClick={closeImage}
						className="absolute top-4 right-4 text-white hover:text-gray-300"
					>
						<X className="w-8 h-8" />
					</button>

					<button
						onClick={() => navigateImage("prev")}
						className="absolute left-4 text-white hover:text-gray-300"
					>
						<ChevronLeft className="w-8 h-8" />
					</button>

					<div className="max-w-4xl max-h-screen">
						<img
							src={selectedImage}
							alt="Enlarged clinic view"
							className="max-h-[90vh] max-w-full object-contain"
						/>
					</div>

					<button
						onClick={() => navigateImage("next")}
						className="absolute right-4 text-white hover:text-gray-300"
					>
						<ChevronRight className="w-8 h-8" />
					</button>

					<div className="absolute bottom-4 text-white">
						{currentIndex + 1} / {photos.length}
					</div>
				</div>
			)}
		</div>
	);
};

export default PhotoGallery;
