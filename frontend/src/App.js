import React, { useState, useCallback, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  Image,
  theme,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Center,
  useColorMode,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUtensils, FaSearch, FaUpload, FaSun, FaMoon, FaDesktop, FaTimes, FaCamera } from 'react-icons/fa';
import Camera from './Camera';

// Configure axios defaults
axios.defaults.timeout = 30000;
const API_URL = 'http://localhost:8000';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const ThemeToggle = () => {
  const { colorMode, setColorMode } = useColorMode();
  
  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const savedTheme = localStorage.getItem('theme-preference');
    
    if (savedTheme === 'system') {
      setColorMode(systemTheme);
    } else if (savedTheme) {
      setColorMode(savedTheme);
    }
  }, [setColorMode]);

  const handleThemeChange = (theme) => {
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setColorMode(systemTheme);
      localStorage.setItem('theme-preference', 'system');
    } else {
      setColorMode(theme);
      localStorage.setItem('theme-preference', theme);
    }
  };

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Theme options"
        icon={colorMode === 'light' ? <FaSun /> : <FaMoon />}
        variant="ghost"
        size="md"
      />
      <MenuList>
        <MenuItem icon={<FaSun />} onClick={() => handleThemeChange('light')}>Light</MenuItem>
        <MenuItem icon={<FaMoon />} onClick={() => handleThemeChange('dark')}>Dark</MenuItem>
        <MenuItem icon={<FaDesktop />} onClick={() => handleThemeChange('system')}>System</MenuItem>
      </MenuList>
    </Menu>
  );
};

function App() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBorderColor = useColorModeValue('blue.400', 'blue.300');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const uploadIconColor = useColorModeValue('blue.500', 'blue.300');
  const ghostBg = useColorModeValue('transparent', 'transparent');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setSelectedFile(file);
    setResults(null);
    setError(null);

    toast({
      title: 'Image uploaded successfully!',
      description: 'Click Analyze to process the image',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleCameraCapture = useCallback((imageSrc) => {
    // Convert base64 to blob
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setPreview(imageSrc);
        setShowCamera(false);
        setResults(null);
        setError(null);
        
        toast({
          title: 'Photo captured successfully!',
          description: 'Click Analyze to process the image',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      });
  }, [toast]);

  const analyzeImage = async () => {
    if (!selectedFile) {
      toast({
        title: 'No image selected',
        description: 'Please select an image first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setAnalyzing(true);
    setResults(null);
    setError(null);
    setShowConfetti(false);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_URL}/analyze-food`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data?.results?.length > 0) {
        setResults(response.data.results);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      let errorMessage = 'Error analyzing food';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.response) {
        errorMessage = error.response.data?.detail || error.message;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check if the backend is running.';
      }
      
      setError(errorMessage);
      toast({
        title: 'Error analyzing food',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': []},
    multiple: false,
  });

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const removeImage = () => {
    setPreview(null);
    setSelectedFile(null);
    setResults(null);
    setError(null);
  };

  return (
    <ChakraProvider theme={theme}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      {showCamera && (
        <Camera
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
      <Container maxW="container.lg" py={8}>
        <MotionVStack
          spacing={8}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex w="100%" justify="space-between" align="center" position="relative">
            <Box flex="1" textAlign="center">
              <Heading
                size="xl"
                color={headingColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={3}
              >
                <FaUtensils />
                Food Analyzer
              </Heading>
            </Box>
            <Box position="absolute" right="0" top="50%" transform="translateY(-50%)">
              <ThemeToggle />
            </Box>
          </Flex>

          <Box
            w="100%"
            p={6}
            borderWidth="2px"
            borderRadius="xl"
            borderStyle="dashed"
            borderColor={isDragActive ? hoverBorderColor : borderColor}
            bg={ghostBg}
            transition="all 0.2s"
            _hover={{ borderColor: hoverBorderColor }}
          >
            <AnimatePresence mode="wait">
              <MotionBox
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <VStack spacing={4}>
                  <Box {...getRootProps()} w="100%" textAlign="center" cursor="pointer">
                    <input {...getInputProps()} />
                    <VStack spacing={3}>
                      <Box 
                        p={4} 
                        borderRadius="full" 
                        bg={ghostBg}
                        color={uploadIconColor}
                        transition="all 0.2s"
                      >
                        <FaUpload size="2em" />
                      </Box>
                      <Text color={textColor}>
                        Drag & drop an image here, or click to select
                      </Text>
                    </VStack>
                  </Box>
                  <Button
                    leftIcon={<FaCamera />}
                    colorScheme="blue"
                    variant="outline" //outline or ghost
                    onClick={() => setShowCamera(true)}
                    size="lg"
                    borderRadius="full"
                  >
                    Take Photo
                  </Button>
                </VStack>
              </MotionBox>
            </AnimatePresence>
          </Box>

          <AnimatePresence>
            {preview && (
              <MotionVStack
                w="100%"
                spacing={4}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  w="100%"
                  maxW="400px"
                  mx="auto"
                  borderRadius="xl"
                  overflow="hidden"
                  boxShadow="xl"
                  position="relative"
                >
                  <Image
                    src={preview}
                    alt="Food preview"
                    w="100%"
                    h="auto"
                    objectFit="cover"
                    transition="transform 0.3s"
                    _hover={{ transform: 'scale(1.02)' }}
                  />
                  <IconButton
                    icon={<FaTimes />}
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme="red"
                    size="sm"
                    isRound
                    onClick={removeImage}
                    aria-label="Remove image"
                  />
                </Box>
                <Center>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={analyzeImage}
                    isLoading={analyzing}
                    loadingText="Analyzing..."
                    leftIcon={<FaSearch />}
                    px={8}
                    py={6}
                    fontSize="lg"
                    borderRadius="full"
                    boxShadow="lg"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'xl',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    transition="all 0.2s"
                  >
                    Analyze Food
                  </Button>
                </Center>
              </MotionVStack>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {analyzing && (
              <MotionBox
                w="100%"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Text
                  textAlign="center"
                  mb={2}
                  color="blue.600"
                  fontWeight="medium"
                  fontSize="lg"
                >
                  Analyzing your food...
                </Text>
                <Progress
                  size="xs"
                  isIndeterminate
                  colorScheme="blue"
                  borderRadius="full"
                />
              </MotionBox>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Alert status="error" borderRadius="xl" boxShadow="md">
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>Error analyzing food</AlertTitle>
                    <AlertDescription display="block">
                      {error}
                      {preview && (
                        <Button
                          mt={2}
                          size="sm"
                          colorScheme="red"
                          onClick={analyzeImage}
                          isLoading={analyzing}
                          leftIcon={<FaSearch />}
                          borderRadius="full"
                        >
                          Retry Analysis
                        </Button>
                      )}
                    </AlertDescription>
                  </Box>
                </Alert>
              </MotionBox>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {results?.map((result, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                p={6}
                borderRadius="xl"
                boxShadow="xl"
                bg={ghostBg}
                w="100%"
                border="1px"
                borderColor={borderColor}
                transitionProperty="all"
                transitionDuration="0.3s"
                _hover={{ 
                  boxShadow: "2xl", 
                  transform: "translateY(-2px)"
                }}
              >
                <VStack align="stretch" spacing={6}>
                  <Heading size="lg" color={headingColor}>
                    {result.food_item}
                  </Heading>
                  <Divider />
                  <SimpleGrid columns={[2, null, 4]} spacing={6}>
                    <Box p={4} borderRadius="lg" bg={ghostBg} boxShadow="sm">
                      <Stat>
                        <StatLabel color={textColor}>Calories</StatLabel>
                        <StatNumber color="blue.500">{result.nutritional_info.calories}</StatNumber>
                      </Stat>
                    </Box>
                    <Box p={4} borderRadius="lg" bg={ghostBg} boxShadow="sm">
                      <Stat>
                        <StatLabel color={textColor}>Protein</StatLabel>
                        <StatNumber color="green.500">{result.nutritional_info.protein}</StatNumber>
                      </Stat>
                    </Box>
                    <Box p={4} borderRadius="lg" bg={ghostBg} boxShadow="sm">
                      <Stat>
                        <StatLabel color={textColor}>Carbs</StatLabel>
                        <StatNumber color="orange.500">{result.nutritional_info.carbs}</StatNumber>
                      </Stat>
                    </Box>
                    <Box p={4} borderRadius="lg" bg={ghostBg} boxShadow="sm">
                      <Stat>
                        <StatLabel color={textColor}>Fat</StatLabel>
                        <StatNumber color="red.500">{result.nutritional_info.fat}</StatNumber>
                      </Stat>
                    </Box>
                  </SimpleGrid>
                  <Box
                    bg={ghostBg}
                    p={4}
                    borderRadius="lg"
                    boxShadow="inner"
                  >
                    <Text fontSize="md" color={textColor} lineHeight="tall">
                      {result.nutritional_info.details}
                    </Text>
                  </Box>
                </VStack>
              </MotionBox>
            ))}
          </AnimatePresence>
        </MotionVStack>
      </Container>
    </ChakraProvider>
  );
}

export default App; 