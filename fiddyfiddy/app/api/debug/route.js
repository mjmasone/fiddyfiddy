import { NextResponse } from 'next/server';

// DEBUG endpoint - shows raw Knack object info
// Access via /api/debug?object=raffles or ?object=tickets

const KNACK_APP_ID = process.env.KNACK_APP_ID;
const KNACK_API_KEY = process.env.KNACK_API_KEY;

const OBJECTS = {
  settings: 'object_4',
  users: 'object_5',
  raffles: 'object_6',
  tickets: 'object_7',
  drawLog: 'object_8',
  transactions: 'object_9',
};

export async function GET(request) {
  const url = new URL(request.url);
  const objectName = url.searchParams.get('object') || 'tickets';
  const recordId = url.searchParams.get('id');
  
  const objectId = OBJECTS[objectName];
  if (!objectId) {
    return NextResponse.json({ 
      error: true, 
      message: `Unknown object: ${objectName}. Valid objects: ${Object.keys(OBJECTS).join(', ')}` 
    });
  }

  try {
    // If record ID provided, get that specific record
    let endpoint = `https://api.knack.com/v1/objects/${objectId}/records`;
    if (recordId) {
      endpoint += `/${recordId}`;
    } else {
      endpoint += '?rows_per_page=1'; // Just get first record to see structure
    }
    
    const res = await fetch(endpoint, {
      headers: {
        'X-Knack-Application-Id': KNACK_APP_ID,
        'X-Knack-REST-API-Key': KNACK_API_KEY,
      },
    });

    const data = await res.json();

    // Return raw data with field analysis
    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      const fields = Object.keys(record)
        .filter(k => k.startsWith('field_'))
        .sort((a, b) => {
          const numA = parseInt(a.replace('field_', ''));
          const numB = parseInt(b.replace('field_', ''));
          return numA - numB;
        })
        .map(k => ({
          field: k,
          value: record[k],
          rawValue: record[`${k}_raw`],
        }));
      
      return NextResponse.json({
        object: objectName,
        objectId,
        totalRecords: data.total_records,
        fields,
        rawRecord: record,
      });
    }
    
    return NextResponse.json({
      object: objectName,
      objectId,
      data,
    });

  } catch (error) {
    return NextResponse.json({ error: true, message: error.message }, { status: 500 });
  }
}
