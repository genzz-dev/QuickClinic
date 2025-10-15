import React from "react";
import { Upload } from "lucide-react";

const FileUploadSection = ({ files, handleFileChange }) => {
	return (
		<div className="bg-gray-50 rounded-lg p-6">
			<div className="flex items-center mb-4">
				<Upload className="h-5 w-5 text-blue-600 mr-2" />
				<h3 className="text-lg font-semibold text-gray-900">Photos & Logo</h3>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Clinic Logo
					</label>
					<input
						type="file"
						accept="image/*"
						onChange={(e) => handleFileChange(e, "logo")}
						className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
					/>
					{files.logo && (
						<p className="mt-2 text-sm text-green-600">✓ {files.logo.name}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Clinic Photos
					</label>
					<input
						type="file"
						accept="image/*"
						multiple
						onChange={(e) => handleFileChange(e, "photos")}
						className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
					/>
					{files.photos.length > 0 && (
						<p className="mt-2 text-sm text-green-600">
							✓ {files.photos.length} photo(s) selected
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default FileUploadSection;
