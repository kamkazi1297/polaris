namespace Polaris;

static class Program
{
    [STAThread]
    static void Main()
    {
        try
        {
            Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
            Application.ThreadException += (_, e) => ShowCrash(e.Exception);
            AppDomain.CurrentDomain.UnhandledException += (_, e) =>
            {
                if (e.ExceptionObject is Exception ex) ShowCrash(ex);
            };
            ApplicationConfiguration.Initialize();
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
        catch (Exception ex)
        {
            ShowCrash(ex);
        }
    }

    static void ShowCrash(Exception ex)
    {
        try
        {
            Paths.Ensure();
            var path = Path.Combine(Paths.Root, "crash.log");
            File.WriteAllText(path, DateTime.Now + Environment.NewLine + ex);
            MessageBox.Show(
                "پولاریس باز نشد." + Environment.NewLine + Environment.NewLine +
                ex.Message + Environment.NewLine + Environment.NewLine +
                "جزئیات خطا در:" + Environment.NewLine + path,
                "Polaris",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
        catch
        {
            MessageBox.Show(ex.ToString(), "Polaris");
        }
    }
}
