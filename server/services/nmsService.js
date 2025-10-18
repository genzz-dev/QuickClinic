import puppeteer from "puppeteer";

const TIMEOUT = 30000; // 30 seconds timeout

export const checkDoctorName = async (
	inputName,
	regNumber,
	regYear,
	stateCouncil,
) => {
	let browser = null;

	try {
		browser = await puppeteer.launch({
			headless: true,
		});

		const page = await browser.newPage();

		// Navigate to the IMR page
		await page.goto(
			"https://www.nmc.org.in/information-desk/indian-medical-register/",
			{
				waitUntil: "networkidle2",
				timeout: TIMEOUT,
			},
		);

		// Click the "Browse By Any Details" tab (advanceSearch)
		await page.waitForSelector('a[href="#advanceSearch"]', {
			timeout: TIMEOUT,
		});
		await page.click('a[href="#advanceSearch"]');

		// Wait for the advance search form
		await page.waitForSelector("#advance_form", { timeout: TIMEOUT });

		// Fill in the form fields
		if (inputName) {
			await page.waitForSelector("#doctorName", { timeout: TIMEOUT });
			await page.type("#doctorName", inputName);
		}

		if (regNumber) {
			await page.waitForSelector("#doctorRegdNo", { timeout: TIMEOUT });
			await page.type("#doctorRegdNo", regNumber);
		}

		if (regYear) {
			await page.waitForSelector("#doctorYear", { timeout: TIMEOUT });
			await page.select("#doctorYear", regYear);
		}

		if (stateCouncil) {
			await page.waitForSelector("#advsmcId", { timeout: TIMEOUT });

			// Convert state council name to ID if needed
			let councilId = stateCouncil;
			if (isNaN(stateCouncil)) {
				councilId = getStateCouncilId(stateCouncil);
			}

			// Check if council ID exists in options
			const councilOptions = await page.evaluate(() => {
				const select = document.querySelector("#advsmcId");
				return Array.from(select.options).map((option) => ({
					value: option.value,
					text: option.text,
				}));
			});

			const validOption = councilOptions.find(
				(option) => option.value === councilId.toString(),
			);
			if (!validOption && councilId !== "") {
				// Try to find by partial text match
				const textMatch = councilOptions.find(
					(option) =>
						option.text.toLowerCase().includes("gujarat") ||
						option.text
							.toLowerCase()
							.includes(stateCouncil.toLowerCase().split(" ")[0]),
				);
				if (textMatch) {
					councilId = textMatch.value;
				}
			}

			await page.select("#advsmcId", councilId.toString().trim());
		}

		// Submit the form
		await page.click("#doctor_advance_Details");

		// Wait for search results or error
		try {
			await Promise.race([
				page.waitForSelector("#doct_info5", { timeout: TIMEOUT }),
				page.waitForFunction(
					() => {
						const errorDiv = document.querySelector("#advanceSearchError");
						return errorDiv && errorDiv.style.display !== "none";
					},
					{ timeout: TIMEOUT },
				),
			]);

			// Wait for AJAX call to complete
			await page.waitForFunction(
				() => {
					const processingDiv = document.querySelector(
						"#doct_info5_processing",
					);
					const isProcessing =
						processingDiv && processingDiv.style.display !== "none";

					const tbody = document.querySelector("#doct_info5 tbody");
					const hasRows = tbody && tbody.children.length > 0;

					const noDataMsg = document.querySelector(".dataTables_empty");
					const hasNoDataMessage =
						noDataMsg && noDataMsg.style.display !== "none";

					const errorDiv = document.querySelector("#advanceSearchError");
					const hasError = errorDiv && errorDiv.style.display !== "none";

					return !isProcessing && (hasRows || hasNoDataMessage || hasError);
				},
				{ timeout: TIMEOUT },
			);
		} catch (timeoutError) {
			if (browser) await browser.close();
			return {
				match: false,
				error: "Search timeout - no results or error message appeared",
			};
		}

		// Check for error message
		const errorVisible = await page.evaluate(() => {
			const errorDiv = document.querySelector("#advanceSearchError");
			return errorDiv && errorDiv.style.display !== "none";
		});

		if (errorVisible) {
			const errorText = await page.evaluate(() => {
				return document.querySelector("#advanceSearchError")?.innerText.trim();
			});
			if (browser) await browser.close();
			return { match: false, error: errorText || "Search error occurred" };
		}

		// Wait for results table
		await page.waitForSelector("#doct_info5", { timeout: TIMEOUT });

		// Check if results table has data
		const tableStatus = await page.evaluate(() => {
			const table = document.querySelector("#doct_info5");
			const tbody = table?.querySelector("tbody");
			const rowCount = tbody ? tbody.children.length : 0;

			const noDataCell = tbody?.querySelector("td.dataTables_empty");
			const noDataMessage = noDataCell?.innerText.trim();

			const dataRows = tbody
				? Array.from(tbody.children).filter(
						(row) => !row.querySelector(".dataTables_empty"),
					)
				: [];

			return {
				hasTable: !!table,
				totalRows: rowCount,
				dataRows: dataRows.length,
				noDataMessage: noDataMessage,
			};
		});

		const hasResults = tableStatus.dataRows > 0;

		if (!hasResults) {
			if (browser) await browser.close();
			return {
				match: false,
				fetchedName: "No results found",
			};
		}

		// Extract doctor data
		const doctorInfo = await page.evaluate(() => {
			const firstRow = document.querySelector("#doct_info5 tbody tr");
			if (!firstRow) return null;

			const cells = firstRow.querySelectorAll("td");
			return {
				yearOfInfo: cells[1]?.innerText.trim(),
				registrationNumber: cells[2]?.innerText.trim(),
				stateCouncil: cells[3]?.innerText.trim(),
				name: cells[4]?.innerText.trim(),
				fatherName: cells[5]?.innerText.trim(),
			};
		});

		if (!doctorInfo || !doctorInfo.name) {
			if (browser) await browser.close();
			return { match: false, fetchedName: "Doctor information not found" };
		}

		const isMatch = inputName
			? doctorInfo.name.toLowerCase().includes(inputName.toLowerCase()) ||
				inputName.toLowerCase().includes(doctorInfo.name.toLowerCase())
			: true;

		const result = {
			match: isMatch,
			fetchedName: doctorInfo.name,
			doctorInfo: doctorInfo,
		};

		if (browser) await browser.close();
		return result;
	} catch (err) {
		if (browser) await browser.close();
		return { match: false, error: err.message };
	}
};

// Helper function to get state council ID by name
export const getStateCouncilId = (councilName) => {
	const councils = {
		"Andhra Pradesh Medical Council": "1",
		"Arunachal Pradesh Medical Council": "2",
		"Assam Medical Council": "3",
		"Bhopal Medical Council": "28",
		"Bihar Medical Council": "4",
		"Bombay Medical Council": "29",
		"Chandigarh Medical Council": "30",
		"Chattisgarh Medical Council": "5",
		"Delhi Medical Council": "6",
		"Goa Medical Council": "7",
		"Gujarat Medical Council": "8",
		"Haryana Medical Council": "9",
		"Himachal Pradesh Medical Council": "10",
		"Hyderabad Medical Council": "45",
		"Jammu & Kashmir Medical Council": "11",
		"Jharkhand Medical Council": "12",
		"Karnataka Medical Council": "13",
		"Madhya Pradesh Medical Council": "15",
		"Madras Medical Council": "36",
		"Mahakoshal Medical Council": "35",
		"Maharashtra Medical Council": "16",
		"Manipur Medical Council": "26",
		"Medical Council of India": "46",
		"Medical Council of Tanganyika": "47",
		"Mizoram Medical Council": "42",
		"Mysore Medical Council": "37",
		"Nagaland Medical Council": "41",
		"Orissa Council of Medical Registration": "17",
		"Pondicherry Medical Council": "38",
		"Punjab Medical Council": "18",
		"Rajasthan Medical Council": "19",
		"Sikkim Medical Council": "20",
		"Tamil Nadu Medical Council": "21",
		"Telangana State Medical Council": "43",
		"Travancore Cochin Medical Council, Trivandrum": "50",
		"Tripura State Medical Council": "22",
		"Uttar Pradesh Medical Council": "23",
		"Uttarakhand Medical Council": "24",
		"Vidharba Medical Council": "40",
		"West Bengal Medical Council": "25",
	};

	return councils[councilName] || councilName;
};
