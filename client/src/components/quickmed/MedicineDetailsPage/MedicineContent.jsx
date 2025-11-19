import { Users, Package, AlertCircle } from 'lucide-react';
import InfoSection from './InfoSection';
import SimpleSection from './SimpleSection';
import MetadataCard from './MetadataCard';
import SpecialPopulations from './SpecialPopulations';
import IngredientsSection from './IngredientsSection';
import Disclaimer from './Disclaimer';

const MedicineContent = ({ medicineData }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetadataCard label="Product Type" value={medicineData.productType} />
        <MetadataCard label="Route of Administration" value={medicineData.route} />
        <MetadataCard
          label="Active Ingredient"
          value={medicineData.activeIngredients?.[0]?.split('\n')[0]}
        />
      </div>

      {/* Main Sections */}
      <div className="space-y-6">
        {/* Critical Warnings - Always First */}
        <InfoSection
          icon="AlertTriangle"
          title="Important Warnings"
          content={medicineData.warnings}
          variant="warning"
        />

        <InfoSection
          icon="Shield"
          title="Boxed Warning"
          content={medicineData.boxedWarning}
          variant="warning"
        />

        {/* Usage Information */}
        <InfoSection icon="Info" title="Purpose" content={medicineData.purpose} variant="info" />

        <InfoSection
          icon="FileText"
          title="Indications and Uses"
          content={medicineData.indications}
          variant="default"
        />

        <InfoSection
          icon="Activity"
          title="Dosage and Administration"
          content={medicineData.dosage}
          variant="info"
        />

        {/* Clinical Information */}
        <SimpleSection title="Description" content={medicineData.description} />

        <SimpleSection title="Side Effects" content={medicineData.sideEffects} />

        <SimpleSection title="Contraindications" content={medicineData.contraindications} />

        <SimpleSection title="Precautions" content={medicineData.precautions} />

        <SimpleSection title="Drug Interactions" content={medicineData.interactions} />

        <SimpleSection title="Overdosage" content={medicineData.overdosage} />

        {/* Special Populations */}
        <SpecialPopulations medicineData={medicineData} />

        {/* Ingredients */}
        <IngredientsSection medicineData={medicineData} />

        {/* Storage */}
        <InfoSection
          icon="Thermometer"
          title="Storage Information"
          content={medicineData.storage}
          variant="default"
        />
      </div>

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
};

export default MedicineContent;
