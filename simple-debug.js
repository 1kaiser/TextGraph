// Simple test script to manually trigger GAT functions
console.log('🧪 Manual GAT Test');

// Test data
const testParagraph = 'Neural networks are powerful tools. Graph attention mechanisms capture relationships.';
const testQuery = 'graph attention mechanisms';

console.log('📝 Test paragraph:', testParagraph);
console.log('🎯 Test query:', testQuery);

// Check if functions exist
if (typeof computeGATAttention !== 'undefined') {
  console.log('✅ computeGATAttention function exists');
  
  try {
    const result = computeGATAttention(testParagraph, testQuery);
    console.log('🧠 Educational GAT result:', result);
  } catch (error) {
    console.error('❌ Educational GAT error:', error);
  }
} else {
  console.error('❌ computeGATAttention function not found');
}

if (typeof computeOriginalGATAttention !== 'undefined') {
  console.log('✅ computeOriginalGATAttention function exists');
  
  try {
    const result = computeOriginalGATAttention(testParagraph, testQuery);
    console.log('🔬 Original GAT result:', result);
  } catch (error) {
    console.error('❌ Original GAT error:', error);
  }
} else {
  console.error('❌ computeOriginalGATAttention function not found');
}

// Check for existing dual matrices
const dualMatrices = document.querySelectorAll('.dual-matrix');
console.log(`📊 Existing dual matrices: ${dualMatrices.length}`);

const educationalMatrix = document.querySelectorAll('.educational-matrix');
const originalMatrix = document.querySelectorAll('.original-matrix');
console.log(`🎓 Educational matrix: ${educationalMatrix.length}`);
console.log(`🔬 Original matrix: ${originalMatrix.length}`);

// Check for any SVG elements
const allSVGs = document.querySelectorAll('svg');
console.log(`🖼️ Total SVG elements: ${allSVGs.length}`);

const allRects = document.querySelectorAll('rect');
console.log(`📐 Total rectangles: ${allRects.length}`);

console.log('✅ Manual test complete - check console output above');