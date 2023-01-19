from forex_python.converter import CurrencyRates
import sys
#TO DO, make the code for just 1 item?
ProfitMarginDec = 1.3

#Multiply PricePerItem with however much Profit (in decimal) you want.
def CalculatedSalesPrice(Price, Profit):
    return Price*Profit

#Adds VAT to CalculatedSalesPrice (Not Used?)
def CalculatedSalesPriceVAT(CalculatedSalesPrice):
    VAT = 1.25
    #!Currently not using either of these.
    SalesTax = 1.2
    return CalculatedSalesPrice * VAT

#Uses forex_python to grab exchange rate from specified currency to DKK, and adds 5% for Conversion Fee.
#Forex_python gets their data from https://theforexapi.com/, which (supposedly) updates daily at 3PM CET.
#Supports: USD, JPY, BGN, CZK, DKK, GBP, EUR, HUF, PLN, RON, SEK, CHF, ISK, NOK, TRY,
#AUD, BRL, CAD, CNY, HKD, IDR, INR, KRW, MXN, MYR, NZD, PHP, SGD, THB, ZAR.
#Eventually I should make this Cache results for 24 hours.
def CurrencyConversion(ExchangeCurrency):
    #CurrencyRate = CurrencyRates()
    #try:
    #    return CurrencyRate.get_rate(ExchangeCurrency, 'DKK') * 1.05
    #except:
    #    return "?"
    return 6.85 * 1.05

#Hopefully fine? Talk with Anders
def CalcOutsideEbitsOutsideEU(TotalPriceBeforeCalc, ExchangeCurrencyStr):
    ImportFee = 160
    TransactionFee = 1.03
    ImportTax = 1.05
    CurrencyRate = CurrencyConversion(ExchangeCurrencyStr)
    if(CurrencyRate == "?"):
        return CurrencyRate
    Calculation = ((TotalPriceBeforeCalc*CurrencyRate)*ImportTax)+ImportFee
    Calculation = CalculatedSalesPrice(Calculation, ProfitMarginDec)
    return Calculation

#Talk with Anders
def CalcOutsideEbitsInsideEU(TotalPriceBeforeCalc, ExchangeCurrencyStr):
    if(ExchangeCurrencyStr == "DKK"):
        Calculation = 0
    Calculation = 0
    Calculation = CalculatedSalesPrice(Calculation, ProfitMarginDec)
    return null

#Function to define price of individual items based on several factors from USD to DKK
def DKKPrice(TotalPriceBeforeCalc, OutsideEbits, OutsideEU, ExchangeCurrencyStr = "DKK"):
    if(OutsideEbits == False):
        Calculation = TotalPriceBeforeCalc * 0.8
    elif(OutsideEbits == True and OutsideEU == True):
        Calculation = CalcOutsideEbitsOutsideEU(TotalPriceBeforeCalc, ExchangeCurrencyStr)
    elif(OutsideEbits == True and OutsideEU == False):
        #Obviously do something here.
        Calculation = null
    return Calculation

def CheckTrueOrFalse(Boolean):
    if(Boolean.lower() == "true"):
        Result = True
        return Result
    Result = False
    return Result


DKKPriceToBeSoldFor = DKKPrice(float(sys.argv[1]), CheckTrueOrFalse(sys.argv[2]), CheckTrueOrFalse(sys.argv[3]), sys.argv[4])
print(DKKPriceToBeSoldFor)
