// src/components/BillSplitter.tsx
import React, { useMemo, useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import html2canvas from "html2canvas";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

type SplitType = "equal" | "percentage" | "share" | "order";

export default function BillSplitter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  //const isTablet = useMediaQuery(theme.breakpoints.down('md'));
	
  // --- basic UI state
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [numPeople, setNumPeople] = useState<number>(2);

  // text input for total (string so user can type); parsed when needed
  const [totalStr, setTotalStr] = useState<string>("");

  // per-person arrays (length === numPeople)
  const [namesEnabled, setNamesEnabled] = useState<boolean>(false);
  const [names, setNames] = useState<string[]>([]);

  const [percentages, setPercentages] = useState<number[]>([]);
  const [shares, setShares] = useState<number[]>([]);
  const [orders, setOrders] = useState<number[]>([]); // amounts per person (order mode)

  // toggles
  const [vatEnabled, setVatEnabled] = useState<boolean>(false);
  const [vatPercent, setVatPercent] = useState<number>(12);
  const [roundOff, setRoundOff] = useState<boolean>(true);

  // results and modal
  const [results, setResults] = useState<number[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>("");
  const [dialogAction, setDialogAction] = useState<null | (() => void)>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  const handleScreenshot = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current);
      const imgData = canvas.toDataURL("image/png");

      // Create download link
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "bill-split.png";
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
    }
  };

  // Keep person-related arrays in sync with numPeople
  React.useEffect(() => {
    const ensureLength = <T,>(arr: T[], def: T) =>
      arr.length === numPeople ? arr : [...arr.slice(0, numPeople), ...Array(Math.max(0, numPeople - arr.length)).fill(def)];

    setNames((prev) => ensureLength(prev, ""));
    setPercentages((prev) => {
      if (splitType === "percentage") {
        // if already have values and same length, keep; else distribute equally
        if (prev.length === numPeople) return prev;
        const base = Math.floor(100 / numPeople);
        const rem = 100 - base * numPeople;
        const out = Array(numPeople).fill(base).map((v, i) => (i < rem ? v + 1 : v));
        return out;
      }
      return ensureLength(prev, 0);
    });
    setShares((prev) => ensureLength(prev, 1)); // default 1 share each
    setOrders((prev) => ensureLength(prev, 0));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPeople, splitType]);

  // helper to parse total
  const totalAmount = useMemo(() => {
    const n = parseFloat(totalStr as string);
    return Number.isFinite(n) ? n : 0;
  }, [totalStr]);

  // helper to apply VAT
  const applyVat = (amount: number) => (vatEnabled ? amount * (1 + vatPercent / 100) : amount);

  // numeric stepper helpers for a given array setter
  const updateArrayValue = (setter: (v: any) => void, arr: any[], index: number, value: any) => {
    const copy = [...arr];
    copy[index] = value;
    setter(copy);
  };

  // Auto-fix percentages (scale proportionally or equalize if all zero)
  const autoFixPercentages = () => {
    const sum = percentages.reduce((a, b) => a + b, 0);
    let next: number[] = [];
    if (sum === 0) {
      const base = Math.floor(100 / numPeople);
      const rem = 100 - base * numPeople;
      next = Array(numPeople).fill(base).map((v, i) => (i < rem ? v + 1 : v));
    } else {
      // scale and round, then adjust last to make sum 100
      next = percentages.map((p) => Math.round((p / sum) * 100));
      const s2 = next.reduce((a, b) => a + b, 0);
      const diff = 100 - s2;
      next[next.length - 1] += diff;
    }
    setPercentages(next);
    setDialogOpen(false);
  };

  // compute results when user presses Calculate
  const handleCalculate = () => {
    // ensure arrays lengths
    const ppl = numPeople;
    if (ppl < 1) {
      setDialogMessage("Enter a valid number of people (at least 1).");
      setDialogAction(() => () => setDialogOpen(false));
      setDialogOpen(true);
      return;
    }

    if (splitType === "percentage") {
      const sum = percentages.reduce((a, b) => a + b, 0);
      if (sum !== 100) {
        setDialogMessage(`Percentages add up to ${sum}%. They must total 100%.`);
        setDialogAction(() => autoFixPercentages);
        setDialogOpen(true);
        return;
      }
      // calculate per person
      const baseTotal = totalAmount;
      const totalWithVat = applyVat(baseTotal);
      let raw = percentages.map((p) => (p / 100) * totalWithVat);
      if (roundOff) {
        // round each, then adjust last to match rounded total
        const roundedTotal = Math.round(totalWithVat);
        const rounded = raw.map((r) => Math.round(r));
        const diff = roundedTotal - rounded.reduce((a, b) => a + b, 0);
        rounded[rounded.length - 1] += diff;
        setResults(rounded);
      } else {
        setResults(raw);
      }
      return;
    }

    if (splitType === "equal") {
      const totalWithVat = applyVat(totalAmount);
      const raw = Array(ppl).fill(totalWithVat / ppl);
      if (roundOff) {
        const roundedTotal = Math.round(totalWithVat);
        const rounded = raw.map((r) => Math.round(r));
        const diff = roundedTotal - rounded.reduce((a, b) => a + b, 0);
        rounded[rounded.length - 1] += diff;
        setResults(rounded);
      } else {
        setResults(raw);
      }
      return;
    }

    if (splitType === "share") {
      const totalShares = shares.reduce((a, b) => a + (Number(b) || 0), 0);
      if (totalShares <= 0) {
        setDialogMessage("Total shares must be greater than 0.");
        setDialogAction(() => () => setDialogOpen(false));
        setDialogOpen(true);
        return;
      }
      const totalWithVat = applyVat(totalAmount);
      const raw = shares.map((s) => ((Number(s) || 0) / totalShares) * totalWithVat);
      if (roundOff) {
        const roundedTotal = Math.round(totalWithVat);
        const rounded = raw.map((r) => Math.round(r));
        const diff = roundedTotal - rounded.reduce((a, b) => a + b, 0);
        rounded[rounded.length - 1] += diff;
        setResults(rounded);
      } else {
        setResults(raw);
      }
      return;
    }

    if (splitType === "order") {
      // orders array contains each person's order amounts; total computed from orders
      const sumOrders = orders.reduce((a, b) => a + (Number(b) || 0), 0);
      if (sumOrders <= 0) {
        setDialogMessage("Please enter at least one order amount (per person).");
        setDialogAction(() => () => setDialogOpen(false));
        setDialogOpen(true);
        return;
      }
      const totalWithVat = applyVat(sumOrders);
      // We proportionally adjust each person's share based on their order to account for VAT
      const raw = orders.map((o) => ((Number(o) || 0) / sumOrders) * totalWithVat);
      if (roundOff) {
        const roundedTotal = Math.round(totalWithVat);
        const rounded = raw.map((r) => Math.round(r));
        const diff = roundedTotal - rounded.reduce((a, b) => a + b, 0);
        rounded[rounded.length - 1] += diff;
        setResults(rounded);
      } else {
        setResults(raw);
      }
      return;
    }
  };

  // UI helpers
  const personLabel = (i: number) => (namesEnabled && names[i] ? names[i] : `Person ${i + 1}`);

  // Mobile-optimized person row component
  const personRow = (i: number, value: number, onInc: () => void, onDec: () => void, onChange: (v: number) => void, valueLabel?: string) => (
    <Box key={i} sx={{ 
      mb: 2,
      p: 2,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      backgroundColor: "primary.main",
    }}>
      {/* Name field - full width on mobile */}
      <TextField
        placeholder={`Person ${i + 1}`}
        value={namesEnabled ? (names[i] || "") : `Person ${i + 1}`}
        onChange={(e) => {
          if (!namesEnabled) return; 
          const copy = [...names];
          copy[i] = e.target.value;
          setNames(copy);
        }}
        size="small"
        fullWidth
        sx={{
          mb: 1.5,
          backgroundColor: !namesEnabled ? "#f0f0f0" : "white",
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: "#888", 
          },
        }}
        InputProps={{
          readOnly: !namesEnabled,
        }}
      />

      {/* Value controls - responsive layout */}
      <Stack 
        direction={isMobile ? "column" : "row"} 
        spacing={1} 
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            minWidth: isMobile ? 'auto' : 100,
            textAlign: isMobile ? 'center' : 'left'
          }}
        >
          {valueLabel}
        </Typography>
        
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1,
          width: isMobile ? '100%' : 'auto'
        }}>
          <IconButton 
            size={isMobile ? "medium" : "small"} 
            onClick={onDec}
            sx={{ 
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' }
            }}
          >
            <RemoveIcon fontSize={isMobile ? "medium" : "small"} />
          </IconButton>
          
          <TextField
            value={value ?? ""}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            size={isMobile ? "medium" : "small"}
            sx={{ 
              width: isMobile ? '120px' : '100px',
              textAlign: "center",
              '& input': { 
                textAlign: 'center',
                fontSize: isMobile ? '1.1rem' : '0.875rem',
                fontWeight: 600
              }
            }}
            inputProps={{ 
              inputMode: "numeric", 
              pattern: "[0-9]*",
              style: { textAlign: 'center' }
            }}
          />
          
          <IconButton 
            size={isMobile ? "medium" : "small"} 
            onClick={onInc}
            sx={{ 
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' }
            }}
          >
            <AddIcon fontSize={isMobile ? "medium" : "small"} />
          </IconButton>
        </Box>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ 
      display: "flex", 
      justifyContent: "center", 
      p: isMobile ? 1 : 2,
      minHeight: '100vh',
      bgcolor: 'grey.50',
	  py: 6,
        px: 2
    }}>
      <Card sx={{
        width: "100%",
        maxWidth: isMobile ? '100%' : 720,
        borderRadius: isMobile ? 2 : 3,
        p: 0,
        boxShadow: isMobile ? "0 4px 12px rgba(0,0,0,0.1)" : "0 8px 30px rgba(0,0,0,0.12)",
        background: "white",
        minHeight: isMobile ? 'calc(100vh - 16px)' : 'auto'
      }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              textAlign: 'center',
              mb: 3
            }}
          >
            Bill Splitter
          </Typography>

          {/* Bill type - stack on mobile for better touch targets */}
          <ToggleButtonGroup
            value={splitType}
            exclusive
            onChange={(_, v) => { if (v) setSplitType(v); setResults(null); }}
            orientation={isMobile ? "vertical" : "horizontal"}
            fullWidth
            sx={{ 
              mb: 3,
              '& .MuiToggleButton-root': {
                py: isMobile ? 1.5 : 1,
                fontSize: isMobile ? '0.9rem' : '0.875rem',
                fontWeight: 600
              }
            }}
          >
            <ToggleButton value="equal">Equal Split</ToggleButton>
            <ToggleButton value="percentage">By Percentage</ToggleButton>
            <ToggleButton value="share">By Shares</ToggleButton>
            <ToggleButton value="order">By Order Amount</ToggleButton>
          </ToggleButtonGroup>

          {/* Number of people - larger touch targets on mobile */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Number of people
          </Typography>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            mb: 3,
            gap: 2
          }}>
            <IconButton
              onClick={() => setNumPeople((n) => Math.max(1, n - 1))}
              size={isMobile ? "large" : "medium"}
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <RemoveIcon />
            </IconButton>
            <Typography 
              variant={isMobile ? "h4" : "h5"} 
              sx={{ 
                minWidth: isMobile ? 60 : 46, 
                textAlign: "center",
                fontWeight: 700,
                bgcolor: 'grey.100',
                py: 1,
                px: 2,
                borderRadius: 2
              }}
            >
              {numPeople}
            </Typography>
            <IconButton 
              onClick={() => setNumPeople((n) => n + 1)} 
              size={isMobile ? "large" : "medium"}
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Split type inputs */}
          {splitType === "equal" && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Total Amount
              </Typography>
              <TextField
                label="Enter total amount"
                value={totalStr}
                onChange={(e) => setTotalStr(e.target.value)}
                placeholder="0.00"
                fullWidth
                size={isMobile ? "medium" : "small"}
                inputProps={{ 
                  inputMode: "decimal",
                  style: { fontSize: isMobile ? '1.1rem' : '0.875rem' }
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: isMobile ? '1.1rem' : '0.875rem',
                    py: isMobile ? 2 : 1.5
                  }
                }}
              />
            </Box>
          )}

          {splitType === "percentage" && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Percentages (must total 100%)
              </Typography>
              {Array.from({ length: numPeople }).map((_, i) =>
                personRow(
                  i,
                  percentages[i] ?? 0,
                  () => updateArrayValue(setPercentages, percentages, i, (Number(percentages[i] || 0) + 1)),
                  () => updateArrayValue(setPercentages, percentages, i, Math.max(0, Number(percentages[i] || 0) - 1)),
                  (v) => updateArrayValue(setPercentages, percentages, i, v),
                  "%"
                )
              )}
              <TextField
                label="Total amount"
                value={totalStr}
                onChange={(e) => setTotalStr(e.target.value)}
                placeholder="0.00"
                fullWidth
                size={isMobile ? "medium" : "small"}
                sx={{ 
                  mt: 2,
                  '& .MuiInputBase-input': {
                    fontSize: isMobile ? '1.1rem' : '0.875rem',
                    py: isMobile ? 2 : 1.5
                  }
                }}
                inputProps={{ 
                  inputMode: "decimal",
                  style: { fontSize: isMobile ? '1.1rem' : '0.875rem' }
                }}
              />
            </>
          )}

          {splitType === "share" && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Share units per person
              </Typography>
              {Array.from({ length: numPeople }).map((_, i) =>
                personRow(
                  i,
                  shares[i] ?? 1,
                  () => updateArrayValue(setShares, shares, i, (Number(shares[i] || 0) + 1)),
                  () => updateArrayValue(setShares, shares, i, Math.max(0, Number(shares[i] || 0) - 1)),
                  (v) => updateArrayValue(setShares, shares, i, v),
                  "shares"
                )
              )}
              <TextField
                label="Total amount"
                value={totalStr}
                onChange={(e) => setTotalStr(e.target.value)}
                placeholder="0.00"
                fullWidth
                size={isMobile ? "medium" : "small"}
                sx={{ 
                  mt: 2,
                  '& .MuiInputBase-input': {
                    fontSize: isMobile ? '1.1rem' : '0.875rem',
                    py: isMobile ? 2 : 1.5
                  }
                }}
                inputProps={{ 
                  inputMode: "decimal",
                  style: { fontSize: isMobile ? '1.1rem' : '0.875rem' }
                }}
              />
            </>
          )}

          {splitType === "order" && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Enter each person's order amount
              </Typography>
              {Array.from({ length: numPeople }).map((_, i) =>
                personRow(
                  i,
                  orders[i] ?? 0,
                  () => updateArrayValue(setOrders, orders, i, Number((orders[i] || 0) + 10)),
                  () => updateArrayValue(setOrders, orders, i, Math.max(0, Number((orders[i] || 0) - 10))),
                  (v) => updateArrayValue(setOrders, orders, i, v),
                  "₱"
                )
              )}
              <TextField
                label="Computed total (from orders)"
                value={orders.reduce((a, b) => a + Number(b || 0), 0).toFixed(2)}
                fullWidth
                size={isMobile ? "medium" : "small"}
                sx={{ 
                  mt: 2,
                  '& .MuiInputBase-input': {
                    fontSize: isMobile ? '1.1rem' : '0.875rem',
                    py: isMobile ? 2 : 1.5
                  }
                }}
                InputProps={{ readOnly: true }}
              />
            </>
          )}

          {/* VAT input */}
          {vatEnabled && (
            <TextField
              label="VAT %"
              value={vatPercent}
              onChange={(e) => setVatPercent(Number(e.target.value || 0))}
              type="number"
              size={isMobile ? "medium" : "small"}
              sx={{ 
                width: isMobile ? "100%" : 120, 
                mb: 2,
                '& .MuiInputBase-input': {
                  fontSize: isMobile ? '1.1rem' : '0.875rem',
                  py: isMobile ? 2 : 1.5
                }
              }}
              inputProps={{ 
                inputMode: "numeric",
                style: { fontSize: isMobile ? '1.1rem' : '0.875rem' }
              }}
            />
          )}

          {/* Optional toggles - stack on mobile */}
          <Box sx={{ 
            display: "flex", 
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 1 : 2, 
            mb: 3,
            '& .MuiFormControlLabel-root': {
              '& .MuiTypography-root': {
                fontSize: isMobile ? '1rem' : '0.875rem'
              }
            }
          }}>
            <FormControlLabel 
              control={<Switch checked={namesEnabled} onChange={(e) => setNamesEnabled(e.target.checked)} />} 
              label="Add names" 
            />
            <FormControlLabel 
              control={<Switch checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} />} 
              label="Include VAT" 
            />
            <FormControlLabel 
              control={<Switch checked={roundOff} onChange={(e) => setRoundOff(e.target.checked)} />} 
              label="Round off (₱)" 
            />
          </Box>

          <Button 
            fullWidth 
            variant="contained" 
            onClick={handleCalculate} 
            size={isMobile ? "large" : "medium"}
            sx={{ 
              py: isMobile ? 2 : 1.5,
              fontSize: isMobile ? '1.1rem' : '0.875rem',
              fontWeight: 600,
              mb: 3
            }}
          >
            Calculate Split
          </Button>

          {/* Results */}
          <div ref={printRef} style={{ 
            background: "#f9f9f9", 
            padding: isMobile ? "16px" : "20px",
            borderRadius: "12px",
            margin: results ? "0" : "0"
          }}>
            {results && (
              <>
                <Typography 
                  variant={isMobile ? "h6" : "h6"} 
                  sx={{ 
                    mb: 2,
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                >
                  Split Result
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {results.map((amt, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                      py: 1,
                      px: isMobile ? 1.5 : 1,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography sx={{ 
                      fontSize: isMobile ? '1rem' : '0.875rem',
                      fontWeight: 500
                    }}>
                      {personLabel(i)}
                    </Typography>
                    <Typography sx={{
                      fontWeight: 700,
                      fontSize: isMobile ? '1.1rem' : '1rem',
                      color: 'primary.main'
                    }}>
                      ₱{(Math.round(amt * 100) / 100).toFixed(2)}
                    </Typography>
                  </Box>
                ))}

                <Divider sx={{ mt: 2, mb: 1.5 }} />
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  py: 1.5,
                  px: isMobile ? 1.5 : 1,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 1
                }}>
                  <Typography sx={{
                    fontWeight: 700,
                    fontSize: isMobile ? '1.1rem' : '1rem'
                  }}>
                    Total
                  </Typography>
                  <Typography sx={{
                    fontWeight: 700,
                    fontSize: isMobile ? '1.2rem' : '1.1rem'
                  }}>
                    ₱{results.reduce((sum, amt) => sum + amt, 0).toFixed(2)}
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ 
                    mt: 2, 
                    display: "block",
                    textAlign: 'center',
                    fontSize: isMobile ? '0.75rem' : '0.7rem'
                  }}
                >
                  {vatEnabled ? `VAT ${vatPercent}% included` : "No VAT"} • {roundOff ? "Amounts rounded" : "Exact"}
                </Typography>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleScreenshot}
                  size={isMobile ? "large" : "medium"}
                  sx={{ 
                    mt: 2,
                    py: isMobile ? 1.5 : 1,
                    fontSize: isMobile ? '1rem' : '0.875rem'
                  }}
                >
                  Save Bill as Image
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            m: isMobile ? 2 : 3,
            width: isMobile ? 'calc(100% - 32px)' : 'auto'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.25rem' : '1.125rem' }}>
          Check inputs
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: isMobile ? '1rem' : '0.875rem' }}>
            {dialogMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 1.5 }}>
          {dialogAction && (
            <Button 
              onClick={() => { dialogAction(); setDialogOpen(false); }}
              size={isMobile ? "medium" : "small"}
            >
              Auto-fix
            </Button>
          )}
          <Button 
            onClick={() => setDialogOpen(false)}
            size={isMobile ? "medium" : "small"}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}