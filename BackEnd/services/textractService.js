const AWS = require('aws-sdk');

/**
 * AWS Textract Service
 * Extracts text and structured data from ID cards using AWS Textract
 */

class TextractService {
  constructor() {
    // Initialize AWS Textract client
    this.textract = new AWS.Textract({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-south-1' // Mumbai region (closest to Bangladesh)
    });

    // Check if credentials are configured
    this.isEnabled = !!(
      process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_SECRET_ACCESS_KEY
    );

    if (!this.isEnabled) {
      console.warn('⚠️  AWS Textract not configured - ID verification will work with manual review only');
    } else {
      console.log('✅ AWS Textract initialized for ID card verification');
    }
  }

  /**
   * Extract text from ID card image
   * @param {Buffer} imageBuffer - Image buffer of ID card
   * @returns {Promise<Object>} Extracted text and confidence scores
   */
  async extractTextFromIDCard(imageBuffer) {
    if (!this.isEnabled) {
      throw new Error('AWS Textract is not configured. Please set AWS credentials in .env file.');
    }

    try {
      console.log('🔍 Starting AWS Textract analysis...');

      // Use AnalyzeID for ID-specific detection (better for ID cards)
      const params = {
        DocumentPages: [
          {
            Bytes: imageBuffer
          }
        ]
      };

      // Use AnalyzeID API (specialized for identity documents)
      const result = await this.textract.analyzeID(params).promise();
      
      console.log('✅ Textract analysis complete');

      // Parse the results
      const extractedData = this.parseAnalyzeIDResult(result);
      
      return extractedData;

    } catch (error) {
      console.error('❌ AWS Textract error:', error);
      
      // Fallback to basic text detection if AnalyzeID fails
      if (error.code === 'InvalidParameterException') {
        console.log('ℹ️  Falling back to basic text detection...');
        return await this.extractTextBasic(imageBuffer);
      }
      
      throw error;
    }
  }

  /**
   * Parse AnalyzeID result to extract structured data
   * @param {Object} result - AWS Textract AnalyzeID result
   * @returns {Object} Parsed data
   */
  parseAnalyzeIDResult(result) {
    const extractedData = {
      fullText: [],
      fields: {},
      documentType: null,
      confidence: 0
    };

    if (!result.IdentityDocuments || result.IdentityDocuments.length === 0) {
      return extractedData;
    }

    const document = result.IdentityDocuments[0];
    
    // Extract document type
    if (document.IdentityDocumentFields) {
      document.IdentityDocumentFields.forEach(field => {
        const fieldType = field.Type?.Text || 'unknown';
        const fieldValue = field.ValueDetection?.Text || '';
        const confidence = field.ValueDetection?.Confidence || 0;

        // Map common ID card fields
        const fieldMapping = {
          'FIRST_NAME': 'firstName',
          'LAST_NAME': 'lastName',
          'FULL_NAME': 'fullName',
          'ID_NUMBER': 'idNumber',
          'DATE_OF_BIRTH': 'dateOfBirth',
          'EXPIRATION_DATE': 'expirationDate',
          'ADDRESS': 'address',
          'DOCUMENT_NUMBER': 'documentNumber',
          'CLASS_NAME': 'className', // For student IDs
          'EMPLOYEE_ID': 'employeeId',
          'DEPARTMENT': 'department'
        };

        const mappedField = fieldMapping[fieldType] || fieldType.toLowerCase();
        
        extractedData.fields[mappedField] = {
          value: fieldValue,
          confidence: confidence
        };

        extractedData.fullText.push(fieldValue);
      });

      // Calculate average confidence
      const confidences = Object.values(extractedData.fields)
        .map(f => f.confidence)
        .filter(c => c > 0);
      
      if (confidences.length > 0) {
        extractedData.confidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
      }
    }

    return extractedData;
  }

  /**
   * Fallback: Basic text detection (not ID-specific)
   * @param {Buffer} imageBuffer - Image buffer
   * @returns {Promise<Object>} Extracted text
   */
  async extractTextBasic(imageBuffer) {
    try {
      const params = {
        Document: {
          Bytes: imageBuffer
        }
      };

      const result = await this.textract.detectDocumentText(params).promise();
      
      const extractedData = {
        fullText: [],
        fields: {},
        documentType: 'unknown',
        confidence: 0
      };

      if (result.Blocks) {
        const textBlocks = result.Blocks
          .filter(block => block.BlockType === 'LINE')
          .map(block => ({
            text: block.Text,
            confidence: block.Confidence
          }));

        extractedData.fullText = textBlocks.map(b => b.text);
        
        // Calculate average confidence
        const avgConfidence = textBlocks.length > 0
          ? textBlocks.reduce((sum, b) => sum + b.confidence, 0) / textBlocks.length
          : 0;
        
        extractedData.confidence = avgConfidence;

        // Try to extract common fields using regex
        const allText = extractedData.fullText.join(' ');
        
        // Look for ID numbers (various formats)
        const idMatch = allText.match(/\b[A-Z0-9]{6,15}\b/);
        if (idMatch) {
          extractedData.fields.idNumber = {
            value: idMatch[0],
            confidence: 80
          };
        }

        // Look for names (capitalized words)
        const nameMatch = allText.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
        if (nameMatch) {
          extractedData.fields.fullName = {
            value: nameMatch[0],
            confidence: 70
          };
        }

        // Look for dates (various formats)
        const dateMatch = allText.match(/\b\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\b/);
        if (dateMatch) {
          extractedData.fields.dateOfBirth = {
            value: dateMatch[0],
            confidence: 75
          };
        }
      }

      return extractedData;

    } catch (error) {
      console.error('❌ Basic text detection error:', error);
      throw error;
    }
  }

  /**
   * Validate ID card image quality
   * @param {Object} extractedData - Data extracted from Textract
   * @returns {Object} Validation result
   */
  validateIDCardQuality(extractedData) {
    const validation = {
      isValid: true,
      issues: [],
      confidence: extractedData.confidence
    };

    // Check if any text was extracted
    if (extractedData.fullText.length === 0) {
      validation.isValid = false;
      validation.issues.push('No text detected - image may be blurry or too dark');
    }

    // Check confidence level
    if (extractedData.confidence < 50) {
      validation.isValid = false;
      validation.issues.push('Low confidence score - image quality may be poor');
    } else if (extractedData.confidence < 70) {
      validation.issues.push('Medium confidence - consider retaking photo in better lighting');
    }

    // Check for minimum required fields
    const hasIdentifier = extractedData.fields.idNumber || 
                          extractedData.fields.documentNumber ||
                          extractedData.fields.employeeId;
    
    if (!hasIdentifier) {
      validation.issues.push('Could not detect ID number - ensure it is clearly visible');
    }

    return validation;
  }

  /**
   * Extract institution name from ID card (for email domain validation)
   * @param {Object} extractedData - Data extracted from Textract
   * @returns {string|null} Institution name
   */
  extractInstitutionName(extractedData) {
    const allText = extractedData.fullText.join(' ').toLowerCase();
    
    // Common institution keywords
    const institutionKeywords = [
      'university', 'college', 'institute', 'academy',
      'school', 'polytechnic', 'varsity', 'বিশ্ববিদ্যালয়'
    ];

    // Look for institution name
    for (const keyword of institutionKeywords) {
      const regex = new RegExp(`([^\\n]*${keyword}[^\\n]*)`, 'i');
      const match = allText.match(regex);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }
}

// Export singleton instance
module.exports = new TextractService();
