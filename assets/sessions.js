/* Shared session registry — single source of truth for the nav bar and the
   index landing page. Edit here once; every page picks it up. */
window.MFML_GROUPS = {
  ala: "Advanced Linear Algebra & Matrix Calculus",
  opt: "Convex Optimization",
  inf: "Probabilistic Modeling & Inference",
  lt:  "Learning Theory",
  it:  "Information Theory & Divergences",
  gen: "Modern Generative & Deep Models",
  cap: "Capstone",
};
window.MFML_SESSIONS = [
  ["ala","01","01_eigendecomposition","Eigendecomposition & the Spectral Theorem","The directions a matrix only scales — and why symmetric matrices are the ones ML loves.",true],
  ["ala","02","02_quadratic_forms","Quadratic forms & positive-definite matrices","Curvature in matrix form — covariance, kernels, and the shape of a loss.",true],
  ["ala","03","03_matrix_calculus","Matrix calculus — Jacobians & Hessians","Differentiating vector- and matrix-valued expressions without index soup.",true],
  ["ala","04","04_factorizations","Factorizations & numerical stability","QR, Cholesky, conditioning — how solvers actually behave in floating point.",true],
  ["opt","05","05_convex_sets_functions","Convex sets & functions","The one property that turns 'search' into 'guaranteed to find the minimum'.",true],
  ["opt","06","06_duality_kkt","Lagrangian duality & KKT","Constraints, multipliers, and the conditions every optimum obeys.",true],
  ["opt","07","07_gradient_methods","Gradient methods & convergence","Momentum, Nesterov, Lipschitz — why step sizes work, and how fast.",true],
  ["opt","08","08_adaptive_second_order","Adaptive & second-order methods","Adam, Newton, L-BFGS — using curvature to move smarter.",true],
  ["inf","09","09_multivariate_gaussians","Multivariate Gaussians & exponential families","The distribution ML runs on, and the family that unifies most of the others.",true],
  ["inf","10","10_mle_fisher","MLE, Fisher information & Cramér–Rao","How much a dataset can possibly tell you about a parameter.",true],
  ["inf","11","11_mcmc","Bayesian inference at scale — MCMC","Sampling from posteriors you can't write down.",true],
  ["inf","12","12_variational_inference","Variational inference & the ELBO","Turning inference into optimization — the engine inside VAEs.",true],
  ["lt","13","13_pac_vc","Bias–variance, PAC & VC dimension","What 'learnable' means, and why capacity controls generalization.",true],
  ["lt","14","14_generalization_bounds","Generalization bounds & Rademacher complexity","Provable guarantees on the gap between train and test error.",true],
  ["it","15","15_mutual_information","Mutual information & f-divergences","Measuring shared information and the distance between distributions.",true],
  ["it","16","16_optimal_transport","Optimal transport & the Wasserstein distance","Moving mass — the geometry-aware distance behind modern generative models.",true],
  ["gen","17","17_attention_math","The math of attention & transformers","Scaled dot-product attention as a differentiable, kernel-like lookup.",true],
  ["gen","18","18_vae","Variational autoencoders","The reparameterization trick and the ELBO, put to work.",true],
  ["gen","19","19_diffusion","Diffusion models & score matching","Learning to reverse noise — SDEs, scores, and denoising.",true],
  ["gen","20","20_normalizing_flows","Normalizing flows & change of variables","Exact likelihoods by tracking how densities warp.",true],
  ["cap","★","21_capstone","Capstone: optimization meets inference","How curvature, duality, and divergences fuse in one modern training objective.",true],
].map(([group,num,slug,title,desc,ready])=>({group,num,slug,title,desc,ready}));
