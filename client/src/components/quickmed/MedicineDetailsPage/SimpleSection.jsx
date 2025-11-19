const SimpleSection = ({ title, content }) => {
  if (!content || (Array.isArray(content) && content.length === 0)) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
      <div className="space-y-2">
        {Array.isArray(content) ? (
          content.map((item, idx) => (
            <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {item}
            </p>
          ))
        ) : (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{content}</p>
        )}
      </div>
    </div>
  );
};

export default SimpleSection;
