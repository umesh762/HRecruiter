import * as XLSX from 'xlsx';
import { RankedCandidate } from '@/types/candidate';

export const exportToExcel = (results: RankedCandidate[]) => {
  // Map the internal RankedCandidate objects to the structure we want in Excel
  const exportData = results.map(candidate => ({
    Rank: candidate.rank,
    Name: candidate.name,
    'Final Score': candidate.final_score,
    'Semantic Score': candidate.semantic_score,
    'Attribute Score': candidate.attribute_score,
    'Signal Score': candidate.signal_score,
    Rationale: candidate.rationale
  }));

  // Create a new workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  
  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ranked Candidates');

  // Auto-size columns slightly for better readability
  const colWidths = [
    { wch: 6 },  // Rank
    { wch: 25 }, // Name
    { wch: 12 }, // Final Score
    { wch: 15 }, // Semantic Score
    { wch: 15 }, // Attribute Score
    { wch: 15 }, // Signal Score
    { wch: 100 } // Rationale
  ];
  worksheet['!cols'] = colWidths;

  // Generate an Excel file and trigger download
  XLSX.writeFile(workbook, 'TalentLens_Ranked_Candidates.xlsx');
};
