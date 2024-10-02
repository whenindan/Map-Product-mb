const HistoricalDataGraph = ({ location, data }) => {
    const [selectedType, setSelectedType] = React.useState('');
    const [chartData, setChartData] = React.useState([]);
  
    React.useEffect(() => {
      if (data && data.length > 0) {
        setSelectedType(data[0].type);
      }
    }, [data]);
  
    React.useEffect(() => {
      if (selectedType) {
        const typeData = data.find(item => item.type === selectedType);
        if (typeData) {
          const formattedData = typeData.data.map(item => ({
            date: new Date(item.date.split('/').reverse().join('-')),
            value: parseFloat(item.value)
          })).sort((a, b) => a.date - b.date);
          setChartData(formattedData);
        }
      }
    }, [selectedType, data]);
  
    const handleTypeChange = (event) => {
      setSelectedType(event.target.value);
    };
  
    return (
      <div style={{ width: '100%', height: '400px' }}>
        <h2>{location} - Historical Data</h2>
        <select value={selectedType} onChange={handleTypeChange}>
          {data.map(item => (
            <option key={item.type} value={item.type}>
              {item.type}
            </option>
          ))}
        </select>
        <Recharts.ResponsiveContainer width="100%" height="100%">
          <Recharts.LineChart data={chartData}>
            <Recharts.CartesianGrid strokeDasharray="3 3" />
            <Recharts.XAxis 
              dataKey="date" 
              tickFormatter={(date) => date.toLocaleDateString()} 
              label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
            />
            <Recharts.YAxis 
              label={{ value: selectedType, angle: -90, position: 'insideLeft' }}
            />
            <Recharts.Tooltip 
              labelFormatter={(date) => date.toLocaleDateString()}
              formatter={(value) => [value, selectedType]}
            />
            <Recharts.Legend />
            <Recharts.Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
          </Recharts.LineChart>
        </Recharts.ResponsiveContainer>
      </div>
    );
  };