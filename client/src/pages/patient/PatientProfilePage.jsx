import {
	AlertCircle,
	Calendar,
	Download,
	Edit3,
	FileText,
	Heart,
	Mail,
	MapPin,
	Phone,
	Plus,
	Save,
	Shield,
	Trash2,
	Upload,
	User,
	UserCheck,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	getPatientProfile,
	updatePatientProfile,
	uploadHealthRecord,
} from "../../service/patientApiService";

const PatientProfilePage = () => {
	const [profile, setProfile] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [showHealthRecordForm, setShowHealthRecordForm] = useState(false);
	const [editFormData, setEditFormData] = useState({});
	const [healthRecordForm, setHealthRecordForm] = useState({
		recordType: "",
		title: "",
		date: "",
		description: "",
	});
	const [selectedFile, setSelectedFile] = useState(null);
	const [profilePictureFile, setProfilePictureFile] = useState(null);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const healthRecordTypes = [
		"allergy",
		"condition",
		"immunization",
		"lab-result",
		"medication",
		"procedure",
		"vital-sign",
	];

	useEffect(() => {
		fetchProfile();
	}, []);

	const fetchProfile = async () => {
		try {
			setIsLoading(true);
			const response = await getPatientProfile();
			console.log(response);
			setProfile(response);
			setEditFormData({
				firstName: response?.firstName || "",
				lastName: response?.lastName || "",
				gender: response?.gender || "",
				phoneNumber: response?.phoneNumber || "",
				address: {
					street: response?.address?.street || "",
					city: response?.address?.city || "",
					state: response?.address?.state || "",
					zipCode: response?.address?.zipCode || "",
					country: response?.address?.country || "",
				},
				emergencyContact: {
					name: response?.emergencyContact?.name || "",
					relationship: response?.emergencyContact?.relationship || "",
					phoneNumber: response?.emergencyContact?.phoneNumber || "",
				},
			});
		} catch (error) {
			setError("Failed to fetch profile data");
			console.error("Error fetching profile:", error);
		} finally {
			setIsLoading(false);
		}
	};
	const handleDownloadFile = async (file) => {
		try {
			// If the file has a direct URL
			if (file.url) {
				const link = document.createElement("a");
				link.href = file.url;
				link.download = file.originalName || "download";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
			// If you need to fetch the file from your API
			else if (file.fileId || file._id) {
				// You'll need to create this API endpoint
				const response = await fetch(
					`/api/health-records/download/${file.fileId || file._id}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`, // or however you handle auth
						},
					},
				);

				if (response.ok) {
					const blob = await response.blob();
					const url = window.URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.download = file.originalName || "download";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					window.URL.revokeObjectURL(url);
				} else {
					setError("Failed to download file");
				}
			}
		} catch (error) {
			console.error("Error downloading file:", error);
			setError("Failed to download file");
		}
	};
	const handleEditToggle = () => {
		setIsEditing(!isEditing);
		setError("");
		setSuccess("");
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		if (name.includes(".")) {
			const [parent, child] = name.split(".");
			setEditFormData((prev) => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: value,
				},
			}));
		} else {
			setEditFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleProfilePictureChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setProfilePictureFile(file);
		}
	};

	const handleSaveProfile = async () => {
		try {
			setIsLoading(true);
			setError("");
			await updatePatientProfile(editFormData, profilePictureFile);
			setSuccess("Profile updated successfully!");
			setIsEditing(false);
			setProfilePictureFile(null);
			await fetchProfile();
		} catch (error) {
			setError("Failed to update profile");
			console.error("Error updating profile:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleHealthRecordInputChange = (e) => {
		const { name, value } = e.target;
		setHealthRecordForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		setSelectedFile(file);
	};

	const handleUploadHealthRecord = async (e) => {
		e.preventDefault();
		if (
			!selectedFile ||
			!healthRecordForm.recordType ||
			!healthRecordForm.title
		) {
			setError("Please fill all required fields and select a file");
			return;
		}

		try {
			setIsLoading(true);
			setError("");
			await uploadHealthRecord(healthRecordForm, selectedFile);
			setSuccess("Health record uploaded successfully!");
			setShowHealthRecordForm(false);
			setHealthRecordForm({
				recordType: "",
				title: "",
				date: "",
				description: "",
			});
			setSelectedFile(null);
			await fetchProfile();
		} catch (error) {
			setError("Failed to upload health record");
			console.error("Error uploading health record:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return "Not specified";
		return new Date(dateString).toLocaleDateString();
	};

	const formatRecordType = (type) => {
		return type
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const getRecordTypeIcon = (type) => {
		const icons = {
			allergy: <AlertCircle className="w-4 h-4" />,
			condition: <Heart className="w-4 h-4" />,
			immunization: <Shield className="w-4 h-4" />,
			"lab-result": <FileText className="w-4 h-4" />,
			medication: <Plus className="w-4 h-4" />,
			procedure: <UserCheck className="w-4 h-4" />,
			"vital-sign": <Heart className="w-4 h-4" />,
		};
		return icons[type] || <FileText className="w-4 h-4" />;
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading profile...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div>
							<h1 className="text-2xl font-bold text-gray-900 mb-2">
								Patient Profile
							</h1>
							<p className="text-gray-600">
								Manage your personal information and health records
							</p>
						</div>

						<div className="flex gap-3">
							{!isEditing ? (
								<button
									onClick={handleEditToggle}
									className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									<Edit3 className="w-4 h-4" />
									Edit Profile
								</button>
							) : (
								<div className="flex gap-2">
									<button
										onClick={handleSaveProfile}
										disabled={isLoading}
										className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
									>
										<Save className="w-4 h-4" />
										Save Changes
									</button>
									<button
										onClick={handleEditToggle}
										className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
									>
										<X className="w-4 h-4" />
										Cancel
									</button>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Error/Success Messages */}
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
						<div className="flex items-center gap-2">
							<AlertCircle className="w-5 h-5 text-red-600" />
							<p className="text-red-800">{error}</p>
						</div>
					</div>
				)}

				{success && (
					<div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
						<div className="flex items-center gap-2">
							<UserCheck className="w-5 h-5 text-green-600" />
							<p className="text-green-800">{success}</p>
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Profile Information */}
					<div className="lg:col-span-2 space-y-8">
						{/* Basic Information */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
							<div className="flex items-center gap-2 mb-6">
								<User className="w-5 h-5 text-blue-600" />
								<h2 className="text-lg font-semibold text-gray-900">
									Basic Information
								</h2>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Profile Picture */}
								{/* Profile Picture */}
								<div className="md:col-span-2 flex items-center gap-4">
									<div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-200">
										{profile?.profilePicture ? (
											<img
												src={profile.profilePicture}
												alt={`${profile?.firstName} ${profile?.lastName}`}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold">
												{profile?.firstName?.[0]}
												{profile?.lastName?.[0]}
											</div>
										)}
									</div>
									{isEditing && (
										<div>
											<input
												type="file"
												accept="image/*"
												onChange={handleProfilePictureChange}
												className="hidden"
												id="profile-picture"
											/>
											<label
												htmlFor="profile-picture"
												className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
											>
												<Upload className="w-4 h-4" />
												{profile?.profilePicture
													? "Change Picture"
													: "Add Picture"}
											</label>
											{profilePictureFile && (
												<p className="text-xs text-green-600 mt-1">
													New picture selected: {profilePictureFile.name}
												</p>
											)}
										</div>
									)}
								</div>

								{/* First Name */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										First Name
									</label>
									{isEditing ? (
										<input
											type="text"
											name="firstName"
											value={editFormData.firstName}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<p className="text-gray-900">
											{profile?.firstName || "Not specified"}
										</p>
									)}
								</div>

								{/* Last Name */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Last Name
									</label>
									{isEditing ? (
										<input
											type="text"
											name="lastName"
											value={editFormData.lastName}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<p className="text-gray-900">
											{profile?.lastName || "Not specified"}
										</p>
									)}
								</div>

								{/* Email */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Email
									</label>
									<p className="text-gray-900">
										{profile?.email || "Not specified"}
									</p>
									{isEditing && (
										<p className="text-xs text-gray-500 mt-1">
											Email cannot be changed
										</p>
									)}
								</div>

								{/* Date of Birth */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Date of Birth
									</label>
									<p className="text-gray-900">
										{formatDate(profile?.dateOfBirth)}
									</p>
									{isEditing && (
										<p className="text-xs text-gray-500 mt-1">
											Date of birth cannot be changed
										</p>
									)}
								</div>

								{/* Gender */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Gender
									</label>
									{isEditing ? (
										<select
											name="gender"
											value={editFormData.gender}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="">Select Gender</option>
											<option value="male">Male</option>
											<option value="female">Female</option>
											<option value="other">Other</option>
										</select>
									) : (
										<p className="text-gray-900">
											{profile?.gender || "Not specified"}
										</p>
									)}
								</div>

								{/* Phone Number */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Phone Number
									</label>
									{isEditing ? (
										<input
											type="tel"
											name="phoneNumber"
											value={editFormData.phoneNumber}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<p className="text-gray-900">
											{profile?.phoneNumber || "Not specified"}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Address Information */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
							<div className="flex items-center gap-2 mb-6">
								<MapPin className="w-5 h-5 text-blue-600" />
								<h2 className="text-lg font-semibold text-gray-900">
									Address Information
								</h2>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Street */}
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Street Address
									</label>
									{isEditing ? (
										<input
											type="text"
											name="address.street"
											value={editFormData.address?.street}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<p className="text-gray-900">
											{profile?.address?.street || "Not specified"}
										</p>
									)}
								</div>

								{/* City */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										City
									</label>
									{isEditing ? (
										<input
											type="text"
											name="address.city"
											value={editFormData.address?.city}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<p className="text-gray-900">
											{profile?.address?.city || "Not specified"}
										</p>
									)}
								</div>

								{/* State */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										State
									</label>
									{isEditing ? (
										<input
											type="text"
											name="address.state"
											value={editFormData.address?.state}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<p className="text-gray-900">
											{profile?.address?.state || "Not specified"}
										</p>
									)}
								</div>

								{/* Zip Code */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Zip Code
									</label>
									{isEditing ? (
										<input
											type="text"
											name="address.zipCode"
											value={editFormData.address?.zipCode}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<p className="text-gray-900">
											{profile?.address?.zipCode || "Not specified"}
										</p>
									)}
								</div>

								{/* Country */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Country
									</label>
									{isEditing ? (
										<input
											type="text"
											name="address.country"
											value={editFormData.address?.country}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<p className="text-gray-900">
											{profile?.address?.country || "Not specified"}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Emergency Contact */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
							<div className="flex items-center gap-2 mb-6">
								<Phone className="w-5 h-5 text-red-600" />
								<h2 className="text-lg font-semibold text-gray-900">
									Emergency Contact
								</h2>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Contact Name */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Contact Name
									</label>
									{isEditing ? (
										<input
											type="text"
											name="emergencyContact.name"
											value={editFormData.emergencyContact?.name}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<p className="text-gray-900">
											{profile?.emergencyContact?.name || "Not specified"}
										</p>
									)}
								</div>

								{/* Relationship */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Relationship
									</label>
									{isEditing ? (
										<input
											type="text"
											name="emergencyContact.relationship"
											value={editFormData.emergencyContact?.relationship}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<p className="text-gray-900">
											{profile?.emergencyContact?.relationship ||
												"Not specified"}
										</p>
									)}
								</div>

								{/* Phone Number */}
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Phone Number
									</label>
									{isEditing ? (
										<input
											type="tel"
											name="emergencyContact.phoneNumber"
											value={editFormData.emergencyContact?.phoneNumber}
											onChange={handleInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									) : (
										<p className="text-gray-900">
											{profile?.emergencyContact?.phoneNumber ||
												"Not specified"}
										</p>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Health Records Sidebar */}
					<div className="space-y-6">
						{/* Health Records */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-2">
									<FileText className="w-5 h-5 text-green-600" />
									<h2 className="text-lg font-semibold text-gray-900">
										Health Records
									</h2>
								</div>
								<button
									onClick={() => setShowHealthRecordForm(true)}
									className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
								>
									<Plus className="w-4 h-4" />
									Add Record
								</button>
							</div>

							{/* Health Records List */}
							<div className="space-y-4">
								{profile?.healthRecords && profile.healthRecords.length > 0 ? (
									profile.healthRecords.map((record, index) => (
										<div
											key={index}
											className="border border-gray-200 rounded-lg p-4"
										>
											<div className="flex items-start justify-between mb-2">
												<div className="flex items-center gap-2">
													{getRecordTypeIcon(record.recordType)}
													<h3 className="font-medium text-gray-900">
														{record.title}
													</h3>
												</div>
												<span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
													{formatRecordType(record.recordType)}
												</span>
											</div>

											<div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
												<Calendar className="w-3 h-3" />
												<span>{formatDate(record.date)}</span>
											</div>

											{record.description && (
												<p className="text-sm text-gray-700 mb-3">
													{record.description}
												</p>
											)}

											{record.files && record.files.length > 0 && (
												<div className="space-y-2">
													<p className="text-xs font-medium text-gray-600">
														Attached Files:
													</p>
													{record.files.map((file, fileIndex) => (
														<div
															key={fileIndex}
															className="flex items-center justify-between bg-gray-50 p-2 rounded"
														>
															<span className="text-sm text-gray-700 truncate">
																{file.originalName}
															</span>
															<button
																onClick={() => handleDownloadFile(file)}
																className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
																title="Download file"
															>
																<Download className="w-4 h-4" />
															</button>
														</div>
													))}
												</div>
											)}
										</div>
									))
								) : (
									<div className="text-center py-8">
										<FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
										<h3 className="text-lg font-medium text-gray-900 mb-2">
											No Health Records
										</h3>
										<p className="text-gray-600 mb-4">
											Upload your first health record to get started
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Health Record Upload Modal */}
				{showHealthRecordForm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-xl shadow-xl w-full max-w-md">
							<div className="p-6">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-lg font-semibold text-gray-900">
										Upload Health Record
									</h3>
									<button
										onClick={() => setShowHealthRecordForm(false)}
										className="text-gray-400 hover:text-gray-600"
									>
										<X className="w-5 h-5" />
									</button>
								</div>

								<form onSubmit={handleUploadHealthRecord} className="space-y-4">
									{/* Record Type */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Record Type *
										</label>
										<select
											name="recordType"
											value={healthRecordForm.recordType}
											onChange={handleHealthRecordInputChange}
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="">Select Type</option>
											{healthRecordTypes.map((type) => (
												<option key={type} value={type}>
													{formatRecordType(type)}
												</option>
											))}
										</select>
									</div>

									{/* Title */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Title *
										</label>
										<input
											type="text"
											name="title"
											value={healthRecordForm.title}
											onChange={handleHealthRecordInputChange}
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="Enter record title"
										/>
									</div>

									{/* Date */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Date
										</label>
										<input
											type="date"
											name="date"
											value={healthRecordForm.date}
											onChange={handleHealthRecordInputChange}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>

									{/* Description */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Description
										</label>
										<textarea
											name="description"
											value={healthRecordForm.description}
											onChange={handleHealthRecordInputChange}
											rows={3}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											placeholder="Enter description (optional)"
										/>
									</div>

									{/* File Upload */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Upload File *
										</label>
										<input
											type="file"
											onChange={handleFileChange}
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
										/>
										<p className="text-xs text-gray-500 mt-1">
											Supported formats: PDF, JPG, PNG, DOC, DOCX
										</p>
									</div>

									{/* Buttons */}
									<div className="flex gap-3 pt-4">
										<button
											type="submit"
											disabled={isLoading}
											className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
										>
											{isLoading ? "Uploading..." : "Upload Record"}
										</button>
										<button
											type="button"
											onClick={() => setShowHealthRecordForm(false)}
											className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default PatientProfilePage;
