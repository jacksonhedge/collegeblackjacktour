import React from 'react';

const SalesPipelineView = ({ pipeline, onUpdate, onConvertToEvent }) => {
  const statusColors = {
    prospect: 'bg-gray-100 text-gray-800',
    contacted: 'bg-blue-100 text-blue-800',
    negotiating: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800'
  };

  const groupedPipeline = pipeline.reduce((acc, lead) => {
    if (!acc[lead.status]) acc[lead.status] = [];
    acc[lead.status].push(lead);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['prospect', 'contacted', 'negotiating', 'confirmed', 'declined'].map((status) => (
          <div key={status} className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium text-gray-900 capitalize">{status}</h3>
              <p className="text-2xl font-bold text-gray-900">
                {groupedPipeline[status]?.length || 0}
              </p>
            </div>
            <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
              {groupedPipeline[status]?.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => onConvertToEvent(lead)}
                >
                  <p className="font-medium text-sm">{lead.collegeName}</p>
                  <p className="text-xs text-gray-600">{lead.fraternityName}</p>
                  <p className="text-xs text-gray-500 mt-1">{lead.contact?.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesPipelineView;